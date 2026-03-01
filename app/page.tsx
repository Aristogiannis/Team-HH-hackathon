"use client";

import { useEffect, useRef, useState } from "react";
import { useRealtimeVoice } from "../hooks/use-realtime-voice";

export default function Home() {
  const [textInput, setTextInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const {
    isActive,
    isConnecting,
    error,
    status,
    messages,
    events,
    isMuted,
    toolCall,
    noiseCancellation,
    startSession,
    stopSession,
    toggleMute,
    sendText,
    videoRef,
    audioRef,
  } = useRealtimeVoice();

  const handleSendText = () => {
    sendText(textInput);
    setTextInput("");
  };

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex h-dvh flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* ── Camera Panel ───────────────────────────────────────── */}
        <div className="relative flex-1 min-h-0 bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          >
            <track kind="captions" />
          </video>

          {/* Status badge – top left */}
          <div className="absolute top-4 left-4 z-10">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-md ${
                isActive
                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                  : isConnecting
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                    : "bg-zinc-800/60 text-zinc-400 border border-zinc-700/40"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isActive
                    ? "bg-green-400 animate-pulse"
                    : isConnecting
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-zinc-500"
                }`}
              />
              {status}
            </span>
          </div>

          {/* Noise cancellation badge – top right */}
          {isActive && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              {toolCall && (
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-md bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
                  ⚙️ {toolCall}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium backdrop-blur-md ${
                  noiseCancellation
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "bg-zinc-800/60 text-zinc-500 border border-zinc-700/40"
                }`}
              >
                {noiseCancellation ? "🔇 NC" : "NC off"}
              </span>
            </div>
          )}

          {/* Overlay controls – bottom center */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
            {!isActive ? (
              <button
                type="button"
                onClick={startSession}
                disabled={isConnecting}
                className="h-14 px-8 rounded-full bg-green-600 hover:bg-green-500 active:scale-95 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold transition-all text-sm shadow-lg shadow-green-900/30 backdrop-blur-md"
              >
                {isConnecting ? "Connecting…" : "▶ Start Session"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`h-12 w-12 rounded-full flex items-center justify-center text-lg transition-all active:scale-95 shadow-lg backdrop-blur-md ${
                    isMuted
                      ? "bg-red-500/80 hover:bg-red-400/80 text-white"
                      : "bg-zinc-800/70 hover:bg-zinc-700/70 text-zinc-200 border border-zinc-600/40"
                  }`}
                  title={isMuted ? "Unmute microphone" : "Mute microphone"}
                >
                  {isMuted ? "🔇" : "🎙️"}
                </button>
                <button
                  type="button"
                  onClick={stopSession}
                  className="h-12 w-12 rounded-full bg-red-600/80 hover:bg-red-500/80 active:scale-95 text-white flex items-center justify-center transition-all shadow-lg backdrop-blur-md"
                  title="End session"
                >
                  <span className="w-4 h-4 bg-white rounded-sm" />
                </button>
              </>
            )}
          </div>

          {/* Idle state placeholder */}
          {!isActive && !isConnecting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 pointer-events-none">
              <div className="text-5xl mb-4">📷</div>
              <p className="text-zinc-400 text-sm">
                Press{" "}
                <span className="font-semibold text-zinc-300">
                  Start Session
                </span>{" "}
                to begin
              </p>
              <p className="text-zinc-500 text-xs mt-1">
                Camera + mic will be requested
              </p>
            </div>
          )}
        </div>

        {/* ── Chat Panel ─────────────────────────────────────────── */}
        <div className="flex flex-col w-full lg:w-95 xl:w-110 border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-900/50 shrink-0 h-[40dvh] lg:h-auto">
          {/* Chat header */}
          <div className="shrink-0 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">
                Conversation
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {messages.length === 0
                  ? "Messages will appear here"
                  : `${messages.length} message${messages.length === 1 ? "" : "s"}`}
              </p>
            </div>
            {events.length > 0 && (
              <details className="relative">
                <summary className="cursor-pointer text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors select-none">
                  Events ({events.length})
                </summary>
                <div className="absolute right-0 top-6 z-20 w-72 rounded-lg bg-zinc-900 border border-zinc-700 p-2 max-h-52 overflow-y-auto shadow-xl">
                  {events.map((evt, i) => (
                    <div
                      key={`evt-${evt.type}-${String(evt.event_id ?? i)}`}
                      className="text-[10px] font-mono text-zinc-500 py-0.5 truncate"
                    >
                      {evt.type}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="shrink-0 mx-3 mt-3 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-red-400 text-xs">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Scrollable messages area */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600 text-xs text-center gap-2 select-none">
                <span className="text-2xl">💬</span>
                <span>Voice &amp; text messages will appear here</span>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : msg.role === "system"
                        ? "bg-purple-500/15 text-purple-300 border border-purple-500/20 rounded-bl-md"
                        : "bg-zinc-800 text-zinc-200 rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <span className="text-[10px] font-medium text-zinc-500 block mb-0.5">
                      Assistant
                    </span>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Text input – pinned at bottom */}
          {isActive && (
            <div className="shrink-0 border-t border-zinc-800 px-3 py-3 flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendText();
                  }
                }}
                placeholder="Type a message…"
                className="flex-1 h-10 rounded-full bg-zinc-800 border border-zinc-700 px-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleSendText}
                disabled={!textInput.trim()}
                className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:bg-zinc-700 disabled:text-zinc-500 text-white flex items-center justify-center transition-all shrink-0"
                title="Send message"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                  role="img"
                >
                  <title>Send</title>
                  <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.11 28.11 0 0 0 15.095-7.907.75.75 0 0 0 0-1.06A28.11 28.11 0 0 0 3.105 2.288Z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden audio element for model voice playback */}
      <audio ref={audioRef} autoPlay className="hidden">
        <track kind="captions" />
      </audio>
    </div>
  );
}
