from __future__ import annotations

import asyncio
import logging
from typing import AsyncIterator

from google import genai
from google.genai import types

from config import settings

logger = logging.getLogger(__name__)


class GeminiLiveSession:
    """Manages a single Gemini Live API session with video input and audio output."""

    def __init__(self, system_instruction: str):
        self._system_instruction = system_instruction
        self._client = genai.Client(api_key=settings.google_api_key)
        self._session = None
        self._ctx_manager = None
        self._resumption_handle: str | None = None
        self._is_connected = False
        self._reconnect_attempts = 0
        self._max_reconnect_attempts = 3

    def _build_config(self) -> types.LiveConnectConfig:
        config = types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            system_instruction=self._system_instruction,
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=settings.voice_name
                    )
                )
            ),
            context_window_compression=types.ContextWindowCompressionConfig(
                sliding_window=types.SlidingWindow(
                    target_tokens=settings.compression_target_tokens
                ),
                trigger_tokens=settings.compression_trigger_tokens,
            ),
            session_resumption=types.SessionResumptionConfig(
                handle=self._resumption_handle,
            ),
            output_audio_transcription=types.AudioTranscriptionConfig(),
        )
        return config

    async def connect(self) -> None:
        config = self._build_config()
        self._ctx_manager = self._client.aio.live.connect(
            model=settings.gemini_model, config=config
        )
        self._session = await self._ctx_manager.__aenter__()
        self._is_connected = True
        self._reconnect_attempts = 0
        logger.info(
            "Gemini session connected (resuming=%s)",
            self._resumption_handle is not None,
        )

    async def send_video_frame(self, jpeg_bytes: bytes) -> None:
        if not self._session or not self._is_connected:
            return
        await self._session.send_realtime_input(
            video=types.Blob(data=jpeg_bytes, mime_type="image/jpeg")
        )

    async def send_text(self, text: str) -> None:
        if not self._session or not self._is_connected:
            return
        await self._session.send_client_content(
            turns=types.Content(
                role="user",
                parts=[types.Part(text=text)],
            ),
            turn_complete=True,
        )

    async def receive_responses(self) -> AsyncIterator[dict]:
        """Yield response dicts from Gemini.

        Each dict has a "type" key:
          - audio:          {"type": "audio", "data": bytes}
          - transcript:     {"type": "transcript", "text": str}
          - interrupted:    {"type": "interrupted"}
          - turn_complete:  {"type": "turn_complete"}
          - go_away:        {"type": "go_away"}
        """
        while self._is_connected and self._session:
            try:
                async for response in self._session.receive():
                    # Store session resumption handle
                    sru = getattr(response, "session_resumption_update", None)
                    if sru:
                        handle = getattr(sru, "new_handle", None) or getattr(
                            sru, "resumption_token", None
                        )
                        if handle:
                            self._resumption_handle = handle

                    # GoAway — server is about to disconnect
                    if getattr(response, "go_away", None) is not None:
                        logger.warning("GoAway received, will reconnect")
                        yield {"type": "go_away"}
                        await self._reconnect()
                        break  # restart the outer while loop with new session

                    sc = getattr(response, "server_content", None)
                    if not sc:
                        continue

                    if getattr(sc, "interrupted", False):
                        yield {"type": "interrupted"}
                        continue

                    # Audio and text from model turn
                    model_turn = getattr(sc, "model_turn", None)
                    if model_turn and model_turn.parts:
                        for part in model_turn.parts:
                            # Audio comes as inline_data
                            inline = getattr(part, "inline_data", None)
                            if inline and getattr(inline, "data", None):
                                yield {"type": "audio", "data": inline.data}
                            # Text parts (rare in audio mode but possible)
                            if getattr(part, "text", None):
                                yield {"type": "transcript", "text": part.text}

                    # Output audio transcription (separate from audio data)
                    ot = getattr(sc, "output_transcription", None)
                    if ot and getattr(ot, "text", None):
                        yield {"type": "transcript", "text": ot.text}

                    if getattr(sc, "turn_complete", False):
                        yield {"type": "turn_complete"}
                else:
                    # Iterator exhausted without GoAway — connection dropped
                    if self._can_reconnect():
                        logger.warning("Receive ended unexpectedly, reconnecting")
                        await self._reconnect()
                        continue
                    break

            except Exception as e:
                logger.error("Receive error: %s", e)
                if self._can_reconnect():
                    await self._reconnect()
                    continue
                break

    def _can_reconnect(self) -> bool:
        return (
            self._is_connected
            and self._resumption_handle is not None
            and self._reconnect_attempts < self._max_reconnect_attempts
        )

    async def _reconnect(self) -> None:
        self._reconnect_attempts += 1
        delay = min(1.0 * (2 ** (self._reconnect_attempts - 1)), 8.0)
        logger.info(
            "Reconnecting (attempt %d/%d) in %.1fs...",
            self._reconnect_attempts,
            self._max_reconnect_attempts,
            delay,
        )
        await asyncio.sleep(delay)
        await self._close_session()
        try:
            await self.connect()
        except Exception as e:
            logger.error("Reconnection failed: %s", e)
            self._is_connected = False

    async def _close_session(self) -> None:
        self._is_connected = False
        if self._ctx_manager:
            try:
                await self._ctx_manager.__aexit__(None, None, None)
            except Exception:
                pass
            self._ctx_manager = None
            self._session = None

    async def close(self) -> None:
        self._is_connected = False
        await self._close_session()
