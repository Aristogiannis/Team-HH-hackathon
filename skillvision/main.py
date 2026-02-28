from __future__ import annotations

import asyncio
import base64
import io
import json
import logging
import sys
import uuid
from pathlib import Path

# Ensure bare imports work regardless of working directory
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse

from config import settings
from gemini_session import GeminiLiveSession
from prompts import build_structured_prompt, build_freeform_prompt
from task_templates import list_templates

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="SkillVision")

# In-memory SOP storage (key: sop_id, value: extracted text)
sop_store: dict[str, str] = {}


# --- REST Endpoints ---


@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    html_path = Path(__file__).parent / "static" / "index.html"
    return HTMLResponse(content=html_path.read_text(), status_code=200)


@app.get("/api/tasks")
async def get_tasks():
    return JSONResponse(content=list_templates())


@app.post("/api/upload-sop")
async def upload_sop(file: UploadFile = File(...)):
    content = await file.read()
    text = ""

    if file.filename and file.filename.lower().endswith(".pdf"):
        try:
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(content))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            return JSONResponse(
                content={"error": f"Failed to read PDF: {e}"},
                status_code=400,
            )
    else:
        text = content.decode("utf-8", errors="replace")

    sop_id = str(uuid.uuid4())[:8]
    sop_store[sop_id] = text
    logger.info("SOP uploaded: id=%s, chars=%d", sop_id, len(text))
    return JSONResponse(content={"sop_id": sop_id, "char_count": len(text)})


# --- WebSocket Endpoint ---


@app.websocket("/ws/session")
async def websocket_session(
    websocket: WebSocket, task_id: str = "", sop_id: str = ""
):
    await websocket.accept()
    logger.info("WebSocket connected: task_id=%r, sop_id=%r", task_id, sop_id)

    # Build system instruction
    sop_content = sop_store.get(sop_id) if sop_id else None
    if task_id:
        system_instruction = build_structured_prompt(task_id, sop_content)
    else:
        system_instruction = build_freeform_prompt(sop_content)

    # Create and connect Gemini session
    gemini = GeminiLiveSession(system_instruction)
    try:
        await gemini.connect()
    except Exception as e:
        logger.error("Failed to connect to Gemini: %s", e)
        await websocket.send_json({"type": "error", "message": str(e)})
        await websocket.close()
        return

    await websocket.send_json({"type": "connected"})
    done = asyncio.Event()

    async def browser_to_gemini():
        """Relay messages from browser to Gemini."""
        try:
            while True:
                raw = await websocket.receive_text()
                msg = json.loads(raw)
                msg_type = msg.get("type")

                if msg_type == "video":
                    jpeg_bytes = base64.b64decode(msg.get("data", ""))
                    await gemini.send_video_frame(jpeg_bytes)
                elif msg_type == "text":
                    await gemini.send_text(msg.get("data", ""))
        except WebSocketDisconnect:
            logger.info("Browser disconnected")
        except Exception as e:
            logger.error("browser_to_gemini error: %s", e)
        finally:
            done.set()

    async def gemini_to_browser():
        """Relay responses from Gemini to browser."""
        try:
            async for response in gemini.receive_responses():
                if done.is_set():
                    break
                if response["type"] == "audio":
                    await websocket.send_bytes(response["data"])
                elif response["type"] == "transcript":
                    await websocket.send_json(
                        {"type": "transcript", "text": response["text"]}
                    )
                elif response["type"] == "interrupted":
                    await websocket.send_json({"type": "interrupted"})
                elif response["type"] == "turn_complete":
                    await websocket.send_json({"type": "turn_complete"})
                elif response["type"] == "go_away":
                    await websocket.send_json({"type": "reconnecting"})
        except WebSocketDisconnect:
            logger.info("Browser disconnected during receive")
        except Exception as e:
            if not done.is_set():
                logger.error("gemini_to_browser error: %s", e)
        finally:
            done.set()

    try:
        await asyncio.gather(browser_to_gemini(), gemini_to_browser())
    except Exception as e:
        logger.error("Session error: %s", e)
    finally:
        await gemini.close()
        logger.info("Session cleaned up")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=settings.host, port=settings.port)
