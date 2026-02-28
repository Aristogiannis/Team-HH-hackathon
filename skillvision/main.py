from __future__ import annotations

import io
import json
import logging
import sys
import uuid
from pathlib import Path
from typing import Any

# Ensure bare imports work regardless of working directory
sys.path.insert(0, str(Path(__file__).resolve().parent))

import httpx
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import HTMLResponse, JSONResponse, PlainTextResponse

from config import settings
from prompts import build_structured_prompt, build_freeform_prompt, build_start_instruction
from task_templates import list_templates, get_template

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="SkillVision")

# In-memory SOP storage (key: sop_id, value: extracted text)
sop_store: dict[str, str] = {}

OPENAI_REALTIME_URL = "https://api.openai.com/v1/realtime/calls"


# --- Tool Definitions ---


def build_tool_definitions(task_id: str) -> list[dict[str, Any]]:
    tools: list[dict[str, Any]] = [
        {
            "type": "function",
            "name": "end_session",
            "description": "The user wants to end the guidance session.",
            "parameters": {},
        },
    ]
    if task_id:
        template = get_template(task_id)
        if template:
            total_steps = len(template["steps"])
            tools.append(
                {
                    "type": "function",
                    "name": "update_step",
                    "description": (
                        "Call this when you begin working on a step or when you "
                        "visually confirm a step is completed and the worker should "
                        "advance. This updates the on-screen step indicator."
                    ),
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "step_number": {
                                "type": "integer",
                                "description": f"The step number (1 to {total_steps}).",
                            },
                            "status": {
                                "type": "string",
                                "enum": ["in_progress", "completed"],
                                "description": "Whether the step is starting or has been completed.",
                            },
                        },
                        "required": ["step_number", "status"],
                    },
                }
            )
    return tools


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


# --- WebRTC SDP Exchange ---


@app.post("/api/rtc-connect")
async def rtc_connect(request: Request):
    """Proxy the SDP exchange with OpenAI to keep the API key server-side."""
    body = await request.json()
    browser_sdp = body.get("sdp", "")
    task_id = body.get("task_id", "")
    sop_id = body.get("sop_id", "")

    if not browser_sdp:
        return JSONResponse(
            content={"error": "Missing SDP offer"},
            status_code=400,
        )

    # Build system prompt
    sop_content = sop_store.get(sop_id) if sop_id else None
    if task_id:
        instructions = build_structured_prompt(task_id, sop_content)
    else:
        instructions = build_freeform_prompt(sop_content)

    # Build start instruction for the initial greeting
    start_instruction = build_start_instruction(task_id)

    # Build session config
    session_config = {
        "type": "realtime",
        "model": settings.openai_model,
        "instructions": instructions,
        "audio": {
            "input": {
                "transcription": {
                    "model": "whisper-1",
                }
            },
            "output": {
                "voice": settings.voice,
            },
        },
        "tools": build_tool_definitions(task_id),
        "tracing": "auto",
    }

    logger.info(
        "RTC connect: task_id=%r, sop=%s, instructions=%d chars",
        task_id,
        "yes" if sop_content else "no",
        len(instructions),
    )

    # POST to OpenAI Realtime API
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                OPENAI_REALTIME_URL,
                headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                files={
                    "sdp": (None, browser_sdp),
                    "session": (None, json.dumps(session_config)),
                },
                timeout=15.0,
            )
        except httpx.TimeoutException:
            return JSONResponse(
                content={"error": "Timeout connecting to OpenAI"},
                status_code=504,
            )
        except httpx.RequestError as e:
            return JSONResponse(
                content={"error": f"Failed to reach OpenAI: {e}"},
                status_code=502,
            )

    if resp.status_code not in (200, 201):
        logger.error("OpenAI error %d: %s", resp.status_code, resp.text)
        return JSONResponse(
            content={"error": resp.text},
            status_code=resp.status_code,
        )

    # Return the SDP answer + start instruction as JSON
    return JSONResponse(
        content={
            "sdp": resp.text,
            "start_instruction": start_instruction,
        }
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=settings.host, port=settings.port)
