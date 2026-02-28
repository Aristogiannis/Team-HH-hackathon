  
**PRODUCT REQUIREMENTS DOCUMENT**

**SkillVision**

Real-Time AI Guidance for Physical Work

MVP / Internal Proof of Concept

| Version: |   1.0 (MVP) |
| ----: | :---- |
| **Date:** |   February 28, 2026 |
| **Status:** |   Internal POC |
| **Classification:** |   Confidential |

# **1\. Executive Summary**

SkillVision is an **AI-powered real-time guidance system** that enables workers to perform skilled physical tasks—particularly electrical work—by providing live visual analysis and voice-guided coaching through a smartphone browser. The system sees what the worker sees via their phone camera and talks them through each step, combining the reasoning power of multimodal AI with the irreplaceable physical capabilities of the human worker.

This document defines the **MVP / internal proof-of-concept** scope. The goal is a working demo that proves the core value proposition: a novice worker can complete a structured electrical task by following real-time AI guidance. This is not designed for scale—it must work reliably for testing, nothing more.

| Design Philosophy Build the simplest thing that works. No auth, no database, no scaling concerns. If it works on one phone with one person, the POC is a success. Every decision should favor speed-to-demo over architectural elegance. |
| :---- |

# **2\. Problem Statement**

Much of the AI conversation focuses on replacing desk jobs. But for physical work—field services, manufacturing, healthcare, trades—AI cannot act in the world. What it can do is see, reason, and guide the human who does.

Today, becoming a skilled electrician requires years of apprenticeship and training. Skilled labor shortages make this economically urgent. Meanwhile, three things have converged: multimodal models can now reliably see and reason about real-world situations, the hardware is already everywhere (smartphones, earbuds), and the economics demand a solution.

SkillVision proves that a worker wearing nothing more than a phone and earbuds can receive **expert-level, context-aware, step-by-step guidance** for tasks they have never performed before. Think of it as the scene in The Matrix where Neo says “I know Kung Fu”—but delivered through real-time AI coaching rather than brain implants.

# **3\. MVP Scope Definition**

## **3.1 What We Are Building**

A browser-based application (mobile-first) where a worker points their smartphone camera at a task environment, and an AI assistant provides real-time voice guidance with step-by-step workflow tracking. The AI can reason purely from visual context or leverage pre-uploaded SOP documents.

## **3.2 Scope Boundaries**

| In Scope (MVP) | Out of Scope (Future) |
| :---- | :---- |
| Single-user browser app on smartphone | Multi-user / team features |
| Real-time camera stream \+ AI voice guidance | Smart glasses / wearable integration |
| Pre-defined task templates (electrician focus) | User-created task templates |
| General-purpose free-form guidance mode | Image/video annotation overlays |
| Optional SOP/manual upload per task | Knowledge base / RAG pipeline |
| Voice output from Gemini Live API | Voice input from user (push-to-talk only for MVP) |
| Session logging (text transcript to console/file) | Analytics dashboard / session history DB |

## **3.3 Hero Demo Scenarios**

**Scenario A: Guided Electrical Task (Structured)**

A novice is walked through replacing a standard wall outlet. The AI recognizes the breaker panel, confirms power is off, identifies wire colors, and guides each connection step-by-step, verifying completion visually before advancing.

**Scenario B: General-Purpose Electrical Inspection (Freeform)**

A worker points their camera at an electrical panel and asks “What am I looking at?” The AI identifies components, flags potential issues (exposed wiring, incorrect labeling, code violations), and offers guidance on next steps.

# **4\. User Experience Flow**

## **4.1 Session Lifecycle**

1. **Open App:** User navigates to the web app URL on their smartphone browser (Chrome/Safari).

2. **Select Mode:** User chooses between a pre-defined task template (e.g., “Replace Wall Outlet”) or free-form guidance mode.

3. **Optional SOP Upload:** For structured tasks, user can optionally upload a PDF/text SOP document that the AI will reference during guidance.

4. **Grant Camera \+ Audio:** Browser requests camera and audio output permissions. Camera feed begins streaming.

5. **AI Initiates:** The AI speaks a greeting, confirms it can see the workspace, and either begins the first step (structured) or asks what the user needs help with (freeform).

6. **Guided Work:** The AI continuously analyzes the camera feed, speaks instructions, monitors progress, and advances through steps. The screen shows current step info and a text transcript.

7. **Completion:** Task ends when all steps are verified complete (structured) or user explicitly ends the session (freeform). Transcript is available for review.

## **4.2 UI Layout (Mobile Browser)**

The interface is designed for hands-free use. The worker should rarely need to touch the screen during active guidance.

* **Top 70%:** Live camera viewfinder (rear camera). This is the worker’s primary view—they hold the phone or mount it to see their workspace.

* **Bottom 30%:** Guidance panel containing:

  * Current step indicator (e.g., “Step 3 of 7: Connect ground wire”)

  * Real-time text transcript of AI speech (scrolling, auto-scrolls to latest)

  * Status indicators: connection status, session duration

* **Floating Controls:** Minimal overlay buttons for Start/Stop session, Push-to-talk (for text messages via keyboard), and End Session.

# **5\. Technical Architecture**

## **5.1 Architecture Overview**

The system follows a simple three-layer architecture. The browser captures camera frames and plays audio. The FastAPI backend proxies communication with the Gemini Live API (since API keys cannot be exposed client-side). The Gemini Live API handles all AI reasoning, visual understanding, and voice generation.

| ┌─────────────────┐     WebSocket      ┌─────────────────┐    google-genai    ┌────────────────┐ │  Browser Client │ ─────────────▶ │  FastAPI Backend │ ─────────────▶ │  Gemini Live API │ │  (HTML/JS)      │ ◀───────────── │  (Python)        │ ◀───────────── │  (Google Cloud)  │ └─────────────────┘                   └─────────────────┘                   └────────────────┘   Camera frames        JPEG base64           Vision \+ reasoning   (JPEG @ 1 FPS)       \+ PCM audio            \+ voice generation   Audio playback       bidirectional          Native audio output   Step UI display                             (24kHz PCM) |
| :---- |

## **5.2 Technology Stack**

| Layer | Technology | Notes |
| :---- | :---- | :---- |
| AI Engine | **Gemini Live API** | Model: gemini-2.5-flash-native-audio-preview. WebSocket-based bidirectional streaming with native voice output. |
| Backend | **Python \+ FastAPI** | Async WebSocket server. Proxies browser \<-\> Gemini communication. Manages sessions and task state. Uses google-genai SDK. |
| SDK | **google-genai** | The new unified Google GenAI SDK (NOT the deprecated google-generativeai). Install: pip install google-genai\[aiohttp\] |
| Frontend | **HTML \+ Vanilla JS** | Single HTML file served by FastAPI. Uses MediaDevices API for camera, Web Audio API for PCM playback. No framework needed. |
| Transport | **WebSocket (x2)** | WS \#1: Browser \<-\> FastAPI (JSON \+ binary audio). WS \#2: FastAPI \<-\> Gemini via google-genai async session. |
| Deployment | **Local / Single Server** | Run locally or on a single cloud VM. HTTPS required for camera access on mobile (use ngrok or self-signed cert for testing). |

## **5.3 Gemini Live API — Key Technical Details**

This section provides the critical details your implementation needs. The Gemini Live API is WebSocket-based and bidirectional, handling vision and voice generation in a single model call.

**Connection & Authentication**

* **Endpoint:** wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent

* **Auth:** API key as query parameter (?key=API\_KEY). For client-side use, generate ephemeral tokens via the server.

* **SDK Pattern:** client.aio.live.connect(model=..., config=...) returns an async context manager yielding an AsyncSession.

**Video Input**

* **Format:** Base64-encoded JPEG frames sent via send\_realtime\_input(video=Blob(...))

* **Frame Rate:** Server processes at 1 FPS. Sending faster is wasteful. 0.5–1 FPS is ideal.

* **Resolution:** 768×768 recommended. Each frame costs \~258 tokens at default resolution.

* **Token Math:** At 1 FPS \+ audio: \~17,000 tokens/minute. Against 128K context window \= \~7.5 min before context fills.

**Audio Output**

* **Format:** Raw 16-bit PCM, little-endian, 24kHz, mono. Streamed in chunks via serverContent messages.

* **Voices:** 30+ HD voices available on native audio models. Recommended for this use case: Kore (neutral, professional) or Charon (authoritative).

* **Interruption:** Automatic via server-side VAD. When user speaks, model generation is immediately canceled and interrupted: true is sent.

**Session Management (Critical)**

**Without mitigation, video sessions die after \~2 minutes.** You MUST enable both of these:

1. **Context Window Compression:** Configure a sliding window that discards oldest turns when token count exceeds a threshold. System instructions survive compression. Set trigger\_tokens=25600 and target\_tokens=12800.

2. **Session Resumption:** WebSocket connections are capped at \~10 minutes. Enable sessionResumption in config. Server sends periodic handles. On disconnect, reconnect with the handle to preserve full context. Handles valid for 2 hours.

**System Instructions & Context**

* System instructions are set at session start and persist through compression—this is where you embed the SOP and behavioral rules.

* Additional context (uploaded SOPs) can be injected via send\_client\_content() as text turns or as prefixTurns that survive compression.

* Function calling is supported for dynamic data retrieval during sessions.

## **5.4 Data Flow — Frame-by-Frame**

1. **Browser captures frame:** Using getUserMedia(), capture rear camera frame, resize to 768×768, encode as JPEG, base64-encode.

2. **Browser sends frame:** Send base64 JPEG over WebSocket to FastAPI backend (JSON: {type: 'video', data: '...'}).

3. **Backend forwards to Gemini:** Call session.send\_realtime\_input(video=Blob(data=decoded\_bytes, mime\_type='image/jpeg')).

4. **Gemini processes \+ generates:** Model analyzes the frame against system instructions and current task state. Generates voice response as PCM audio chunks.

5. **Backend receives audio:** Async receive loop gets serverContent with inline audio data (PCM bytes) and optional text transcript.

6. **Backend forwards to browser:** Send PCM audio chunks over WebSocket as binary frames. Send text transcript and step updates as JSON.

7. **Browser plays audio:** Web Audio API decodes raw PCM at 24kHz and plays through speakers/earbuds. UI updates step indicator and transcript.

# **6\. Backend Specification**

## **6.1 FastAPI Application Structure**

| skillvision/ ├── main.py              \# FastAPI app, WebSocket endpoint, session mgmt ├── gemini\_session.py    \# Gemini Live API wrapper using google-genai ├── task\_templates.py    \# Pre-defined task step definitions ├── prompts.py           \# System instruction templates ├── config.py            \# Environment config (API key, model, etc.) ├── static/ │   └── index.html       \# Single-file frontend (HTML \+ JS \+ CSS) └── requirements.txt     \# Dependencies |
| :---- |

## **6.2 Key Dependencies**

| fastapi\>=0.115.0 uvicorn\[standard\]\>=0.30.0 google-genai\[aiohttp\]\>=1.0.0 python-multipart\>=0.0.9    \# For SOP file upload aiofiles\>=24.1.0           \# Async file handling |
| :---- |

## **6.3 WebSocket Endpoint**

The backend exposes a single WebSocket endpoint at /ws/session. On connection, the backend:

1. Reads query parameters for task\_id (optional, selects a pre-defined template) and sop\_content (optional, base64-encoded SOP text).

2. Constructs the system instruction by combining the base prompt, task template steps (if any), and SOP content (if any).

3. Establishes a Gemini Live API session via client.aio.live.connect() with context window compression and session resumption enabled.

4. Spawns two concurrent async tasks: one to relay browser messages to Gemini, one to relay Gemini responses back to the browser.

## **6.4 REST Endpoints**

| Method | Path | Purpose |
| :---- | :---- | :---- |
| GET | / | Serves the static/index.html frontend |
| GET | /api/tasks | Returns list of available task templates with IDs, names, and step counts |
| POST | /api/upload-sop | Accepts PDF/TXT file upload. Extracts text and returns sop\_id for session use |
| WS | /ws/session | Main session WebSocket. Params: task\_id, sop\_id. Handles bidirectional streaming |

# **7\. System Instruction Design**

The system instruction is the most important piece of the product. It defines the AI’s persona, behavior, safety rules, and task execution logic. It is injected at session start and survives context window compression.

## **7.1 Base System Prompt Structure**

The system prompt should be structured in these sections, in order:

1. **Identity & Persona:** You are SkillVision, a real-time field guidance assistant for electrical work. You speak clearly and concisely. You prioritize safety above all else.

2. **Safety Rules (Non-negotiable):** Always verify power is disconnected before any work instruction. Never instruct work on live circuits. If you detect unsafe conditions, immediately warn the worker and halt guidance. If unsure about safety, err on the side of caution.

3. **Communication Style:** Speak in short, clear sentences. Use directional language (“the red wire on the left”). Confirm understanding before moving to next step. If something looks wrong, say so immediately.

4. **Visual Analysis Instructions:** Describe what you see before giving instructions. Identify wire colors, component types, labels, and conditions. Flag anything that looks damaged, incorrectly installed, or non-standard.

5. **Task Steps (if structured mode):** Dynamically injected from the task template. Each step has an objective, expected visual state, and completion criteria.

6. **SOP Content (if uploaded):** Injected as reference material. The AI should cite specific sections when relevant.

## **7.2 Task Step Verification Logic**

For structured tasks, the AI should follow this pattern for each step:

* **Announce:** “Step 3 of 7: Connect the ground wire. I should see a bare copper wire and a green screw terminal.”

* **Observe:** Continuously analyze the camera feed to assess whether the worker is making progress on the current step.

* **Guide:** Provide specific instructions based on what it sees: “Strip about half an inch of insulation from the green wire. Use the strippers on your left.”

* **Verify:** When the visual state matches the expected completion state, confirm and advance: “Great, that ground connection looks solid. Moving to step 4.”

* **Correct:** If something looks wrong, intervene immediately: “Wait—that wire isn’t seated properly under the screw. Loosen it and try again.”

# **8\. Pre-Defined Task Templates**

Task templates are defined as JSON structures in the backend. Each template contains metadata and a sequence of steps with visual verification criteria. Here are the initial templates to implement:

## **8.1 Template: Replace a Wall Outlet**

| Step | Title | Instruction Summary | Visual Verification |
| :---- | :---- | :---- | :---- |
| 1 | Safety check | Locate breaker panel, identify correct breaker, switch off | Breaker in OFF position. Use voltage tester. |
| 2 | Remove cover plate | Unscrew and remove the outlet cover plate | Cover plate removed, outlet screws visible |
| 3 | Disconnect old outlet | Unscrew outlet from box, carefully pull out, disconnect wires | Wires disconnected, old outlet removed |
| 4 | Identify wires | Identify hot (black), neutral (white), ground (bare/green) | Three wires visible and identified |
| 5 | Connect ground | Attach ground wire to green screw on new outlet | Ground wire secured under green screw |
| 6 | Connect neutral | Attach white wire to silver screw | White wire secured under silver screw |
| 7 | Connect hot | Attach black wire to brass/gold screw | Black wire secured under brass screw |
| 8 | Mount & test | Push outlet into box, screw in, attach cover, restore power, test | Cover plate on, power restored, outlet functional |

## **8.2 Template: Inspect an Electrical Panel**

A 5-step guided inspection covering: visual overview, breaker labeling check, signs of overheating/damage, wire gauge verification, and grounding assessment. Implementation follows the same step/verify pattern as above.

## **8.3 Adding New Templates**

Templates are stored as dictionaries in task\_templates.py. To add a new template, create a new dictionary with an id, name, description, and steps array. Each step has: step\_number, title, instruction, visual\_criteria, and safety\_notes (optional). No code changes elsewhere are required—the template list endpoint auto-discovers them.

# **9\. Frontend Specification**

## **9.1 Single-File Architecture**

The entire frontend is a single index.html file containing inline CSS and JavaScript. No build step, no framework, no dependencies beyond what the browser provides natively. FastAPI serves this file at the root path.

## **9.2 Key Browser APIs**

* navigator.mediaDevices.getUserMedia() — Access rear camera. Constraints: { video: { facingMode: 'environment', width: 768, height: 768 }, audio: false }

* HTMLCanvasElement — Capture frames from video element, encode to JPEG via canvas.toBlob() or toDataURL()

* WebSocket — Connect to /ws/session. Send JSON (video frames, text commands) and receive binary (PCM audio) \+ JSON (transcripts, step updates)

* AudioContext \+ AudioWorklet — Play raw 24kHz PCM audio received from the backend. Buffer chunks and play sequentially to avoid gaps.

## **9.3 Frame Capture Loop**

A setInterval at 1000ms (1 FPS) captures the current video frame to a canvas, encodes as JPEG (quality 0.8), converts to base64, and sends over the WebSocket. The loop pauses when the WebSocket is disconnected and resumes on reconnection.

## **9.4 Audio Playback**

The browser receives raw PCM audio as binary WebSocket messages. It must decode these as 16-bit signed integers at 24kHz sample rate and play them via the Web Audio API. Implementation should use a queue-based approach: buffer incoming chunks and play them sequentially with AudioBufferSourceNode to ensure smooth playback without gaps or pops.

# **10\. SOP Upload & Context Injection**

Users can optionally upload reference documents (SOPs, manuals, procedures) that the AI will reference during guidance sessions.

## **10.1 Upload Flow**

1. User selects a PDF or TXT file via the upload button in the pre-session setup screen.

2. File is POSTed to /api/upload-sop. Backend extracts text content (pypdf for PDFs, direct read for TXT).

3. Extracted text is stored in-memory (dict keyed by a generated sop\_id). No database.

4. When starting a session, the sop\_id is passed as a WebSocket query parameter.

5. Backend retrieves the SOP text and injects it into the system instruction under a clearly delimited section.

## **10.2 Context Injection Strategy**

SOP content should be injected as part of the **system instruction** (not as a conversation turn) so it survives context window compression. If the SOP is very long (\>10,000 tokens), truncate to the most relevant sections and note in the prompt that the full document was truncated. For the MVP, simple text injection is sufficient—no RAG or embedding-based retrieval.

# **11\. Error Handling & Resilience**

The MVP does not need to be production-hardened, but it must handle common failure modes gracefully enough to survive a demo.

| Failure Mode | Detection | Recovery |
| :---- | :---- | :---- |
| Gemini session drops | goAway message or WebSocket close | Auto-reconnect using session resumption handle. Resume from last step. |
| Context window full | Handled by compression config | Sliding window drops oldest turns. System instructions preserved. |
| Browser WS disconnect | WebSocket onclose event | Auto-reconnect with exponential backoff (1s, 2s, 4s). Show status in UI. |
| Camera permission denied | getUserMedia rejection | Show clear instructions on how to grant permission. Block session start. |
| Audio playback issues | AudioContext suspended state | Require user tap to resume AudioContext (browser autoplay policy). Show text transcript as fallback. |
| API rate limit / error | API error responses | Log error, notify user via UI, suggest retry. No automatic retry on API errors. |

# **12\. Configuration & Environment**

## **12.1 Environment Variables**

| GOOGLE\_API\_KEY=your-gemini-api-key GEMINI\_MODEL=gemini-2.5-flash-native-audio-preview-12-2025 VOICE\_NAME=Kore FRAME\_RATE=1.0 FRAME\_RESOLUTION=768 COMPRESSION\_TRIGGER\_TOKENS=25600 COMPRESSION\_TARGET\_TOKENS=12800 HOST=0.0.0.0 PORT=8000 |
| :---- |

## **12.2 Running the Application**

| \# Install dependencies pip install \-r requirements.txt \# Run locally uvicorn main:app \--host 0.0.0.0 \--port 8000 \# For mobile testing (HTTPS required for camera access) \# Option A: ngrok ngrok http 8000 \# Option B: uvicorn with self-signed cert uvicorn main:app \--host 0.0.0.0 \--port 8000 \--ssl-keyfile key.pem \--ssl-certfile cert.pem |
| :---- |

# **13\. Testing & Validation Criteria**

The POC is successful if it passes these acceptance tests:

## **13.1 Core Acceptance Tests**

| \# | Test Case | Pass Criteria |
| :---- | :---- | :---- |
| T1 | Open app on iPhone/Android, see camera feed | Camera feed displays in browser within 3 seconds |
| T2 | AI speaks greeting and describes what it sees | Audio plays through phone speaker within 5 seconds of session start |
| T3 | Point camera at electrical panel; AI identifies components | AI correctly names breakers, wires, or outlets visible in frame |
| T4 | Start structured task; AI walks through steps | Step indicator updates, AI announces each step, verifies completion |
| T5 | Session survives \>2 minutes with video | Context compression activates, session continues without interruption |
| T6 | Upload SOP document, start session referencing it | AI references SOP content in its guidance |
| T7 | Deliberately show unsafe condition to camera | AI immediately warns about safety concern and halts guidance |
| T8 | Text transcript displays alongside audio | Transcript updates in real-time, readable on mobile screen |

# **14\. Known Limitations & Constraints**

* **1 FPS video:** The Gemini Live API processes frames at 1 FPS. Fast movements will be missed. The worker should hold the camera steady and move slowly.

* **Session duration:** Even with compression and resumption, very long sessions may accumulate latency or lose context from early turns. Plan for 15–30 minute maximum sessions.

* **No voice input in MVP:** The worker communicates via text input only (push-to-talk keyboard). Full voice input requires client-side audio capture and streaming, which adds complexity. Add in v2.

* **Single user:** No auth, no multi-tenancy. One session at a time is sufficient for the POC.

* **Lighting dependent:** The AI’s visual analysis quality depends entirely on camera feed quality. Poor lighting or camera shake will degrade performance.

* **Cost:** Gemini Live API bills all accumulated tokens per turn. A 10-minute video session could cost $1–5 depending on interaction frequency. Monitor usage during testing.

* **HTTPS requirement:** Mobile browsers require HTTPS for camera access. Local development needs ngrok or self-signed certificates.

# **15\. Future Considerations (Post-MVP)**

These are explicitly out of scope for the MVP but noted here for context on where the product could go:

* **Voice input:** Add client-side audio capture and stream user’s voice to Gemini for fully hands-free operation.

* **Smart glasses:** Meta Ray-Ban or similar for true hands-free camera mounting.

* **Knowledge base:** RAG pipeline with embedded manuals, code references, and manufacturer specs.

* **Session history:** PostgreSQL storage of session transcripts, screenshots, and step completions.

* **Multi-vertical:** Expand beyond electrical to plumbing, HVAC, automotive, healthcare.

* **B2B features:** Multi-user, team management, admin dashboard, usage analytics.

* **Compliance recording:** Record sessions for quality assurance and regulatory compliance.

* **Offline mode:** Cache task templates and basic guidance for areas with poor connectivity.

*End of Document*