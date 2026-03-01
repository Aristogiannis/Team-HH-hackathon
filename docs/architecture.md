# Architecture

## Overview

Weldy consists of two Next.js applications that work together:

1. **Main App** (port 3000) — the technician-facing voice + vision interface
2. **Manager Dashboard** (port 3001) — the supervisor-facing monitoring panel

## Main App Flow

### Session Lifecycle

```
Browser                    Next.js Server              OpenAI
  │                              │                        │
  │  GET /api/session            │                        │
  │─────────────────────────────>│                        │
  │                              │  POST /v1/realtime/    │
  │                              │  client_secrets        │
  │                              │───────────────────────>│
  │                              │  { value, expires_at } │
  │                              │<───────────────────────│
  │  { value, expires_at }       │                        │
  │<─────────────────────────────│                        │
  │                                                       │
  │  WebRTC SDP Offer                                     │
  │  POST /v1/realtime/calls?model=gpt-realtime           │
  │──────────────────────────────────────────────────────>│
  │  SDP Answer                                           │
  │<──────────────────────────────────────────────────────│
  │                                                       │
  │  ══════ WebRTC established ══════                     │
  │  Audio track (bidirectional)                          │
  │  Data channel (frames + events)                       │
  │<═════════════════════════════════════════════════════>│
```

### Audio Pipeline

Raw mic audio goes through RNNoise before reaching OpenAI:

```
Mic → getUserMedia → AudioContext (48kHz) → ScriptProcessorNode
                                                    │
                        ┌───────────────────────────┘
                        │ 480-sample frames
                        ▼
                    RNNoise WASM
                    (denoise)
                        │
                        ▼
              MediaStreamDestination → WebRTC audio track → OpenAI
```

RNNoise requires exactly 48kHz sample rate and 480-sample (10ms) frames. The ScriptProcessorNode receives 4096-sample buffers and internally chunks them into 480-sample frames for processing.

If RNNoise fails to load (e.g., WASM not available), the pipeline falls back to sending raw audio.

### Camera Frame Capture

Frames are captured at ~1 FPS from the video element:

1. Draw current video frame to an offscreen canvas
2. Export as JPEG base64 (`canvas.toDataURL("image/jpeg", 0.6)`)
3. Send via data channel as a `conversation.item.create` event with `input_image` type
4. OpenAI processes the image alongside the audio stream

### Tool Calling (get_task_steps)

When the AI needs maintenance instructions, it calls `get_task_steps` with a short keyword description. The search pipeline:

1. **Direct match** — substring match on task titles and keywords (instant, zero-cost)
2. **Vector search** — cosine similarity between query embedding and pre-computed task embeddings via `text-embedding-3-small` (threshold: 0.3)
3. **Fuse.js fuzzy** — weighted fuzzy search on title (3x), keywords (2x), category (1x) as a synchronous fallback

The result includes the full task content (steps, specs, warnings) which the AI reads back to the user step by step.

### Transcript Forwarding

During active sessions, transcripts (both user and assistant messages) are forwarded to the manager dashboard:

```
use-realtime-voice.tsx → POST /api/transcripts → POST localhost:3001/api/transcripts
```

The manager dashboard stores these in an in-memory session store and displays them on the Live Monitor page.

## Manager Dashboard

### Pages

- **Dashboard** (`/`) — KPI cards (active sessions, completed today, avg completion time, success rate), active sessions table, activity feed, weekly completion chart
- **Live Monitor** (`/monitor`) — Per-engineer pipeline cards showing current step, next step, progress bar, elapsed time. Polls `/api/sessions` every 3 seconds for live data and merges with mock data.
- **Engineers** (`/engineers`) — Engineer roster with status, specialties, and performance stats
- **Tasks** (`/tasks`) — Task assignment queue with priority levels and due dates
- **Knowledge Base** (`/knowledge-base`) — Browse all 19 maintenance documents

### Data Flow

The dashboard receives live session data from the main app via the transcripts API and merges it with mock data for demo purposes. The session store (`lib/session-store.ts`) holds active sessions in memory.

## Key Design Decisions

- **WebRTC over WebSocket**: Lower latency for real-time audio, native browser support
- **Ephemeral keys**: API key never touches the client — server mints short-lived tokens
- **Client-side noise cancellation**: RNNoise runs in the browser via WASM, reducing background noise before it reaches the API (saves tokens and improves recognition)
- **3-tier search**: Guarantees a response even when embeddings are unavailable, with graceful degradation
- **1 FPS frame rate**: Balances visual context with API costs and bandwidth
