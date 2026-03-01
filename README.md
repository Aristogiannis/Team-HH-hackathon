# Weldy — Cursor for Physical Work

Weldy is an AI-powered real-time guidance platform for hands-on technical work. Think **Cursor, but for mechanics** — a voice + vision assistant that sees what you see through your phone camera and walks you through complex tasks step by step.

**Current domain:** Mercedes-Benz SLK 200 (R170) maintenance — from oil changes to roof operation.

**Use case:** _"Car won't start"_ — a junior mechanic opens Weldy, points the phone at the engine bay, and the AI diagnoses the issue and guides them through a jump start, fuse check, or spark plug replacement, hands-free by voice.

## Quick Start

### Prerequisites

- **Node.js** 20+ (or [Bun](https://bun.sh))
- **OpenAI API key** with access to `gpt-realtime` model

### 1. Install & run the main app

```bash
git clone <repo-url> && cd <repo>
cp .env.example .env   # or create .env manually (see below)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — click **Start Session**, grant camera + mic access, and start talking.

### 2. (Optional) Run the Manager Dashboard

```bash
cd manager-dashboard
npm install
npm run dev
```

Opens on [http://localhost:3001](http://localhost:3001) — live monitoring of all active engineer sessions.

### 3. (Optional) Generate embeddings for semantic search

```bash
bun run scripts/generate-embeddings.ts
# or: npm run embed
```

Pre-computes vector embeddings for the knowledge base using `text-embedding-3-small`. Without this, search falls back to fuzzy matching (still works, just less accurate).

### Environment Variables

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=sk-...       # Required — OpenAI API key
OPENAI_MODEL=gpt-realtime   # Optional (default: gpt-realtime)
VOICE_NAME=alloy             # Optional (default: marin in session config)
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  User's Phone                    │
│         Camera (1 fps frames) + Mic              │
└──────────────┬──────────────────────────────────┘
               │ WebRTC (audio + data channel)
               ▼
┌──────────────────────────────────────────────────┐
│            OpenAI Realtime API                    │
│         (gpt-realtime via WebRTC)                │
│                                                   │
│  - Receives audio stream                          │
│  - Receives camera frames as images               │
│  - Calls get_task_steps tool for guidance          │
│  - Responds by voice in real-time                  │
└──────────┬─────────────────────────────┬─────────┘
           │ Tool call                   │ Voice response
           ▼                             ▼
┌─────────────────────┐    ┌────────────────────────┐
│  Knowledge Base      │    │   Manager Dashboard     │
│  (19 SLK 200 tasks)  │    │   (localhost:3001)      │
│                       │    │                         │
│  Search pipeline:     │    │  - Live session monitor  │
│  1. Direct keyword    │    │  - Engineer pipelines    │
│  2. Vector similarity │    │  - Task assignments      │
│  3. Fuse.js fuzzy     │    │  - KPI dashboard         │
└─────────────────────┘    └────────────────────────┘
```

### Main App (Next.js — port 3000)

| Path | Description |
|---|---|
| `app/page.tsx` | Main UI — split camera + chat layout |
| `app/api/session/route.ts` | Mints ephemeral OpenAI client secret with session config |
| `app/api/embed/route.ts` | Generates embeddings via `text-embedding-3-small` |
| `app/api/transcripts/route.ts` | Proxies transcripts to the manager dashboard |
| `hooks/use-realtime-voice.tsx` | Core hook — WebRTC connection, frame capture, tool calls, data channel |
| `hooks/use-audio-pipeline.ts` | RNNoise WASM noise cancellation (48kHz, 480-sample frames) |
| `lib/search-tasks.ts` | 3-tier search: direct match → vector cosine similarity → Fuse.js fuzzy |
| `data/knowledge-base.ts` | 19 detailed maintenance task documents (specs, steps, warnings) |
| `data/task-embeddings.json` | Pre-computed vectors for semantic search |
| `scripts/generate-embeddings.ts` | Offline script to regenerate embeddings |

### Manager Dashboard (Next.js — port 3001)

| Page | Description |
|---|---|
| `/` | KPI dashboard — active sessions, completion rate, weekly chart |
| `/monitor` | Live engineer pipeline cards — current step, next step, progress |
| `/engineers` | Engineer roster with status and specialties |
| `/tasks` | Task assignment queue with priority and due dates |
| `/knowledge-base` | Browse and view all knowledge base articles |

## How It Works

1. **User clicks Start Session** — the app requests camera + microphone permissions
2. **Ephemeral key** is minted server-side via `/api/session` (configures the Weldy system prompt, tools, and voice)
3. **WebRTC peer connection** is established directly with OpenAI's Realtime API
4. **Audio** streams continuously through an RNNoise noise cancellation pipeline before being sent
5. **Camera frames** are captured at ~1 FPS, drawn to a canvas, converted to base64 JPEG, and sent via the data channel as `input_image` items
6. **When the user describes a task**, the AI calls `get_task_steps` — the app searches the knowledge base using a 3-tier strategy (direct → vector → fuzzy) and returns step-by-step instructions
7. **The AI reads back instructions one step at a time**, using the camera feed to confirm the user's progress before moving on
8. **Transcripts** are forwarded to the manager dashboard so supervisors can monitor all active sessions in real-time

## Knowledge Base

19 tasks covering the Mercedes-Benz SLK 200 (R170):

- **Engine:** oil check/change, coolant, air filter, spark plugs, serpentine belt
- **Brakes:** fluid level, pad/disc inspection
- **Tyres:** pressure check, flat tyre change
- **Dashboard:** warning lights, service indicator reset
- **Exterior:** headlight bulb, tail light bulb
- **Electrical:** fuse box locations, battery/jump start
- **SLK-specific:** Vario roof operation, vehicle specs

## Tech Stack

- **Next.js 16** + React 19 + TypeScript
- **OpenAI Realtime API** (WebRTC, `gpt-realtime` model)
- **RNNoise** (WASM) for client-side noise cancellation
- **OpenAI Embeddings** (`text-embedding-3-small`) for semantic search
- **Fuse.js** for fuzzy text matching fallback
- **Tailwind CSS 4** for styling
- **Recharts** (manager dashboard charts)
- **Lucide React** (manager dashboard icons)
