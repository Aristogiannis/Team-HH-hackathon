# Gemini Multimodal Live API: technical reference for real-time AI guidance

The Gemini Multimodal Live API provides a persistent WebSocket connection that accepts real-time video frames and audio, then returns streaming audio (TTS) responses — exactly what's needed for a real-time AI guidance system. **The API processes video at 1 FPS as base64-encoded JPEG frames and returns raw 24kHz PCM audio**, with the current recommended model being `gemini-2.5-flash-native-audio-preview-12-2025`. The critical constraint for any video+voice system: without context window compression enabled, **video sessions are limited to approximately 2 minutes** before the 128K token context window fills. With sliding-window compression and session resumption, sessions can run indefinitely. This report covers every technical detail needed for a PRD targeting senior staff engineers.

---

## WebSocket protocol and connection lifecycle

The Live API uses a bidirectional WebSocket (not REST or SSE) for all real-time communication. The endpoint for the Gemini Developer API is:

```
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=GEMINI_API_KEY
```

For Vertex AI, the endpoint uses a region-specific URL: `wss://{region}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1.LlmBidiService/BidiGenerateContent` with OAuth 2.0 authentication. Authentication for the Gemini Developer API uses an API key as a query parameter, but production client-side apps should use **ephemeral tokens** (created via `AuthTokenService.CreateToken`, valid for 30 minutes by default) to avoid exposing keys in browser code.

The connection handshake follows a strict sequence. The client must send a `BidiGenerateContentSetup` message as the very first message, containing the model ID, generation config, system instructions, tools, and all session parameters. **Configuration is immutable for the duration of the connection** — you cannot change model, tools, or system instructions mid-session without disconnecting and resuming. The server responds with `BidiGenerateContentSetupComplete`, after which the client can begin sending data.

Four client-to-server message types exist, each carrying exactly one field per message:

- **`setup`** — First message only; configures the entire session
- **`realtimeInput`** — Streams audio, video, and text concurrently without interrupting generation; ordering across modality streams is not guaranteed
- **`clientContent`** — Sends structured text turns; interrupts any ongoing generation
- **`toolResponse`** — Returns function call results to the model

Server-to-client messages include `serverContent` (model turns with audio/text parts, interruption signals, transcriptions), `toolCall` (function calling requests), `goAway` (advance warning before server disconnection with `timeLeft` field), and `sessionResumptionUpdate` (tokens for reconnection).

---

## Models, capabilities, and what's deprecated

The model landscape has shifted significantly. The earlier `gemini-2.0-flash-live-001` and `gemini-2.0-flash-exp` models are **shut down** (deprecated December 9, 2025). The current models for the Live API are:

| Model ID | Platform | Status | Key traits |
|---|---|---|---|
| `gemini-2.5-flash-native-audio-preview-12-2025` | Gemini Developer API | **Preview (recommended)** | Native audio, 131K input / 8K output tokens, thinking support |
| `gemini-2.5-flash-native-audio-preview-09-2025` | Gemini Developer API | Preview | Older preview, improved function calling |
| `gemini-live-2.5-flash-native-audio` | Vertex AI | **GA (recommended)** | Production-grade, same native audio architecture |

The "native audio" designation is significant. These models process raw audio through a **single end-to-end model** rather than a cascaded STT→LLM→TTS pipeline, enabling lower latency, emotion/tone detection, and natural speech patterns. The models support audio generation, function calling, Google Search grounding, thinking, audio transcription, VAD, affective dialog, and proactive audio. They do **not** support image generation, batch API, caching, code execution, structured outputs, or URL context.

---

## Sending video frames and receiving audio responses

### Video input specification

Video frames are sent via the `realtimeInput` message as base64-encoded JPEG data. **The API processes video at exactly 1 FPS** — this is a hard constraint, not a recommendation. Sending frames faster wastes bandwidth without improving results.

```json
{
  "realtimeInput": {
    "video": {
      "data": "<base64-encoded-JPEG>",
      "mime_type": "image/jpeg"
    }
  }
}
```

The recommended resolution is **768×768 pixels**. Token consumption per frame depends on the `mediaResolution` setting: **~258 tokens per frame at default resolution** and **~66 tokens at low resolution**. Combined with audio at ~25–32 tokens/second, a video+audio stream consumes roughly 300 tokens/second at default resolution — meaning the **128K context window fills in approximately 7 minutes** without compression.

### Audio output specification

Audio responses arrive as `inlineData` parts within `serverContent.modelTurn` messages, containing raw PCM bytes. A critical asymmetry exists between input and output audio:

| Parameter | Input | Output |
|---|---|---|
| Format | Raw PCM, 16-bit, little-endian | Raw PCM, 16-bit, little-endian |
| Sample rate | **16 kHz** | **24 kHz** |
| Channels | Mono | Mono |
| MIME type | `audio/pcm;rate=16000` | `audio/pcm` |

Only raw PCM is supported — no MP3, WAV, or Opus encoding over the WebSocket. Applications must handle the sample rate asymmetry with separate audio contexts for input and output. Both input and output audio can be transcribed by enabling `inputAudioTranscription` and `outputAudioTranscription` in the session config; transcriptions arrive as separate server messages with no guaranteed ordering relative to audio data.

Voice selection is configured via `speechConfig` in the generation config. Available voices include Puck, Charon, Kore, Fenrir, Aoede, Leda, Orus, and Zephyr, with **24+ languages** supported and natural multilingual switching. The native audio model also supports affective dialog — adapting tone and emotion based on user input.

---

## google-genai Python SDK patterns

The official SDK is `google-genai` (current version **1.62.0**), installed via `pip install google-genai`. The legacy `google-generativeai` package reached end-of-life on November 30, 2025 and should not be used. The new SDK supports both Gemini Developer API and Vertex AI from a single package.

### Connection and session management

```python
from google import genai
from google.genai import types

client = genai.Client()  # Uses GEMINI_API_KEY env var
MODEL = "gemini-2.5-flash-native-audio-preview-12-2025"

config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    system_instruction="You are a real-time AI guide analyzing a live camera feed.",
    speech_config=types.SpeechConfig(
        voice_config=types.VoiceConfig(
            prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Kore")
        )
    ),
    media_resolution="MEDIA_RESOLUTION_MEDIUM",
    context_window_compression=types.ContextWindowCompressionConfig(
        sliding_window=types.SlidingWindow(target_tokens=12800),
        trigger_tokens=25600,
    ),
    session_resumption=types.SessionResumptionConfig(),
    input_audio_transcription=types.AudioTranscriptionConfig(),
    output_audio_transcription=types.AudioTranscriptionConfig(),
)

async with client.aio.live.connect(model=MODEL, config=config) as session:
    # Session is now active
    ...
```

The `client.aio.live.connect()` method returns an async context manager yielding an `AsyncSession` with these key methods:

- **`session.send_realtime_input(video=..., audio=..., text=...)`** — Send one modality per call
- **`session.send_client_content(turns=..., turn_complete=True)`** — Send structured text turns
- **`session.send_tool_response(function_responses=...)`** — Reply to function calls
- **`session.receive()`** — Async iterator yielding server messages

### Sending video frames via SDK

```python
import cv2, base64
from google.genai import types

# Capture and encode frame
cap = cv2.VideoCapture(0)
ret, frame = cap.read()
frame = cv2.resize(frame, (768, 768))
_, buffer = cv2.imencode('.jpg', frame)

# Send as realtime input — SDK handles WebSocket framing
await session.send_realtime_input(
    video=types.Blob(data=buffer.tobytes(), mime_type="image/jpeg")
)
```

Alternatively, PIL images can be sent directly: `await session.send_realtime_input(media=PIL.Image.open('frame.jpg'))`.

### Receiving and playing audio

```python
import asyncio, pyaudio

RECEIVE_SAMPLE_RATE = 24000
audio_queue = asyncio.Queue()

# Receive task
async for response in session.receive():
    if response.server_content and response.server_content.model_turn:
        for part in response.server_content.model_turn.parts:
            if part.inline_data and isinstance(part.inline_data.data, bytes):
                audio_queue.put_nowait(part.inline_data.data)
    if response.server_content and response.server_content.interrupted:
        while not audio_queue.empty():
            audio_queue.get_nowait()  # Flush on interruption

# Playback task
pya = pyaudio.PyAudio()
stream = pya.open(format=pyaudio.paInt16, channels=1, rate=24000, output=True)
while True:
    chunk = await audio_queue.get()
    await asyncio.to_thread(stream.write, chunk)
```

The recommended pattern uses `asyncio.TaskGroup` to run frame sending, audio receiving, and playback concurrently across separate async tasks.

---

## Browser camera to FastAPI to Gemini pipeline

The recommended production architecture is a **server-to-server proxy**: the browser captures media and streams it to a FastAPI backend, which maintains the persistent WebSocket connection to Gemini. Google explicitly endorses this pattern and provides reference implementations.

### JavaScript client: camera capture at 1 FPS

```javascript
const video = document.getElementById('camera-preview');
video.setAttribute('playsinline', '');  // CRITICAL for iOS Safari

const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment', width: { ideal: 768 }, height: { ideal: 768 } },
    audio: true
});
video.srcObject = stream;

const canvas = document.createElement('canvas');
canvas.width = 768; canvas.height = 768;
const ctx = canvas.getContext('2d');
const ws = new WebSocket('wss://yourserver.com/ws/camera');

setInterval(() => {
    ctx.drawImage(video, 0, 0, 768, 768);
    canvas.toBlob(async (blob) => {
        if (blob && ws.readyState === WebSocket.OPEN) {
            ws.send(await blob.arrayBuffer());  // Binary is most efficient
        }
    }, 'image/jpeg', 0.8);
}, 1000);  // 1 FPS — matches Gemini's processing rate
```

Canvas-based `toBlob()` is preferred over `toDataURL()` because it's async, non-blocking, and avoids the 33% base64 overhead on the client-to-server hop. `MediaRecorder` API is **not suitable** for this use case as it produces encoded video chunks rather than individual frames.

### FastAPI WebSocket proxy

```python
@app.websocket("/ws/camera")
async def camera_websocket(websocket: WebSocket):
    await websocket.accept()
    async with gemini_client.aio.live.connect(model=MODEL, config=CONFIG) as session:
        async def forward_frames():
            while True:
                data = await websocket.receive_bytes()
                b64 = base64.b64encode(data).decode("utf-8")
                await session.send_realtime_input(
                    video={"data": b64, "mime_type": "image/jpeg"}
                )
        async def forward_responses():
            async for response in session.receive():
                if response.server_content and response.server_content.model_turn:
                    for part in response.server_content.model_turn.parts:
                        if part.inline_data:
                            await websocket.send_json({
                                "type": "audio",
                                "data": base64.b64encode(part.inline_data.data).decode()
                            })
        async with asyncio.TaskGroup() as tg:
            tg.create_task(forward_frames())
            tg.create_task(forward_responses())
```

**HTTPS is mandatory** for `getUserMedia` on mobile browsers. iOS Safari requires the `playsinline` attribute on video elements. Bandwidth at 768×768 JPEG quality 0.8 at 1 FPS is approximately **50–80 KB/s** — manageable on mobile networks.

---

## Session limits, pricing, and the 2-minute video trap

### Session duration constraints

This is the most critical architectural consideration. Without context window compression:

- **Audio-only**: ~15 minutes before context window fills
- **Audio + video**: **~2 minutes** before context window fills
- **WebSocket connection**: Server resets after ~10 minutes regardless

**Both context window compression and session resumption must be enabled** for any production video+voice system. Compression uses a sliding window that discards oldest content when accumulated tokens exceed `trigger_tokens`. Session resumption provides reconnection tokens valid for 2 hours, allowing seamless recovery from the 10-minute WebSocket resets. The server sends a `GoAway` message with advance warning before disconnecting.

### Pricing model

The Live API uses **cumulative per-turn billing** — all tokens in the session context window are re-processed and billed with each new turn. For `gemini-2.5-flash-native-audio-preview-12-2025`:

| Component | Price per 1M tokens |
|---|---|
| Input text | $0.50 |
| Input audio | $3.00 |
| Output text | $2.00 |
| Output audio | $12.00 |

Audio consumes ~25–32 tokens/second; video consumes ~258 tokens/second at default resolution. The Google AI Studio free tier includes Live API access with rate limits. Paid tiers support up to **1,000 concurrent sessions** per project on Vertex AI.

### Interruption and turn-taking

Automatic Voice Activity Detection (VAD) is enabled by default. When VAD detects user speech during model output, ongoing generation is immediately canceled and discarded, the server sends an `interrupted: true` signal, and any pending function calls are canceled. Clients must flush their audio playback queue upon receiving the interruption signal. VAD sensitivity is configurable via `startOfSpeechSensitivity` and `endOfSpeechSensitivity` in the setup config.

---

## Critical gotchas for production systems

**WebSocket disconnections are the most reported production issue.** Errors with codes 1008 (Policy Violation) and 1011 (Internal Error) are widespread, typically occurring at 8–12 minute sessions. Messages include "RPC::DEADLINE_EXCEEDED" and "RESOURCE_EXHAUSTED." Auto-reconnection with exponential backoff (3 attempts: 1s, 2s, 4s) and session resumption is essential.

**Function calling is degraded when audio is active.** Google's official documentation states that "audio inputs and audio outputs negatively impact the model's ability to use function calling." Community reports put reliability at ~60–70% in production. Sessions can hang indefinitely when a function call is expected. The `toolConfig.functionCallingConfig` with `mode: ANY` is not available in the Live API.

**Echo cancellation is not built-in.** The API provides no echo cancellation — if speakers are used instead of headphones, the model will hear and interrupt its own output. Client-side echo cancellation or headphone enforcement is required.

**Transcription degrades during long continuous speech.** `inputTranscription` events stop or degrade after ~30 seconds of continuous speech. The workaround is to disable automatic activity detection and send periodic flush signals every 15 seconds.

**No per-session token visibility exists.** There is no way to track token consumption per individual Live API session. `usageMetadata` appears intermittently, and Live API sessions do not appear in Gemini API Logs and Datasets. The standard token counting API does not work for Live API sessions.

**No structured output support.** The Live API does not support `responseSchema` or structured JSON outputs. For structured data extraction, use function calling (with the reliability caveats above) or parse text responses.

## Conclusion

The Gemini Multimodal Live API is production-viable for real-time video+voice guidance, but demands careful architecture around three non-negotiable requirements: enabling context window compression (without it, video sessions die at 2 minutes), implementing session resumption with GoAway handling (WebSocket connections reset at ~10 minutes), and building robust reconnection logic (disconnections are common in production). The `google-genai` SDK at v1.62.0 abstracts the WebSocket complexity well through `client.aio.live.connect()`, and Google's own reference implementations validate the browser → FastAPI → Gemini proxy architecture. The 1 FPS video processing rate and 768×768 recommended resolution make bandwidth requirements modest (~50–80 KB/s), but the cumulative per-turn billing model means costs grow non-linearly with session length. For the PRD, the most impactful design decisions are: choosing low `mediaResolution` to extend session viability (66 vs 258 tokens/frame), designing the system instruction to work within audio-mode function calling limitations, and implementing client-side echo cancellation for speaker-based use cases.