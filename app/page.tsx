"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchTaskDocs } from "../lib/search-tasks";

type RealtimeEvent = {
  type: string;
  [key: string]: unknown;
};

export default function Home() {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Idle");
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [toolCall, setToolCall] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const snapshotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // Capture a frame from the video element as base64 JPEG
  const captureFrame = useCallback(async (): Promise<{
    base64: string;
    mime: string;
  } | null> => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    const srcW = video.videoWidth;
    const srcH = video.videoHeight;
    if (!srcW || !srcH) return null;

    const maxWidth = 512;
    const scale = Math.min(1, maxWidth / srcW);
    const w = Math.round(srcW * scale);
    const h = Math.round(srcH * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, w, h);

    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", 0.7),
    );
    if (!blob) return null;

    const base64: string = await new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        res(result.split(",")[1]); // strip data:...;base64,
      };
      reader.onerror = rej;
      reader.readAsDataURL(blob);
    });

    return { base64, mime: "image/jpeg" };
  }, []);

  // Send a single frame over the data channel
  const sendFrame = useCallback(async () => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open") return;

    const frame = await captureFrame();
    if (!frame) return;

    try {
      dc.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_image",
                image_url: `data:${frame.mime};base64,${frame.base64}`,
              },
            ],
          },
        }),
      );
    } catch (err) {
      console.warn("Failed to send frame:", err);
    }
  }, [captureFrame]);

  // Start the 1 FPS snapshot loop
  const startSnapshotLoop = useCallback(() => {
    if (snapshotIntervalRef.current) return;
    snapshotIntervalRef.current = setInterval(() => {
      sendFrame();
    }, 1000);
  }, [sendFrame]);

  const stopSnapshotLoop = useCallback(() => {
    if (snapshotIntervalRef.current) {
      clearInterval(snapshotIntervalRef.current);
      snapshotIntervalRef.current = null;
    }
  }, []);

  // Toggle microphone mute
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
  }, []);

  // Send a text message via the data channel
  const sendText = useCallback((text: string) => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open" || !text.trim()) return;
    dc.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: text.trim() }],
        },
      }),
    );
    dc.send(JSON.stringify({ type: "response.create" }));
    setTextInput("");
  }, []);

  // Clean up everything
  const cleanup = useCallback(() => {
    stopSnapshotLoop();

    if (dcRef.current) {
      try {
        dcRef.current.close();
      } catch {}
      dcRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.getSenders().forEach((sender) => {
        try {
          sender.track?.stop();
        } catch {}
      });
      try {
        pcRef.current.close();
      } catch {}
      pcRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }

    setIsActive(false);
    setStatus("Idle");
  }, [stopSnapshotLoop]);

  // Start the session
  const startSession = useCallback(async () => {
    if (isActive || isConnecting) return;
    setIsConnecting(true);
    setError(null);
    setTranscript("");
    setAiResponse("");
    setEvents([]);
    setIsMuted(false);
    setStatus("Requesting camera & mic...");

    try {
      // 1. Get user media (video + audio)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 } },
        audio: true,
      });
      localStreamRef.current = stream;

      // Show video preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // 2. Get ephemeral key from our backend
      setStatus("Getting session token...");
      const tokenRes = await fetch("/api/session");
      if (!tokenRes.ok) {
        const detail = await tokenRes.text();
        throw new Error(`Token request failed: ${detail}`);
      }
      const { value: ephemeralKey } = await tokenRes.json();
      if (!ephemeralKey) throw new Error("No ephemeral key received");

      // 3. Create peer connection
      setStatus("Establishing WebRTC connection...");
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Play remote audio (model's voice)
      pc.ontrack = (e) => {
        if (audioRef.current) {
          audioRef.current.srcObject = e.streams[0];
        }
      };

      // Add the audio track to the peer connection
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        pc.addTrack(audioTrack, stream);
      }

      // 4. Create data channel
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.addEventListener("open", async () => {
        console.log("[dc] Data channel open");
        setIsActive(true);
        setStatus("Connected — streaming");

        const video = videoRef.current;
        if (video && video.readyState < 2) {
          await new Promise<void>((resolve) =>
            video.addEventListener("loadeddata", () => resolve(), {
              once: true,
            }),
          );
        }

        await sendFrame();

        // Start sending frames at 1 FPS
        startSnapshotLoop();
      });

      dc.addEventListener("close", () => {
        console.log("[dc] Data channel closed");
        cleanup();
      });

      dc.addEventListener("message", (e) => {
        try {
          const event: RealtimeEvent = JSON.parse(e.data);

          // Only log interesting events, skip the noisy audio deltas
          if (
            event.type !== "response.audio.delta" &&
            event.type !== "response.audio.done"
          ) {
            setEvents((prev) => [event, ...prev].slice(0, 50));
          }

          // Track user transcript
          if (
            event.type ===
            "conversation.item.input_audio_transcription.completed"
          ) {
            const t = (event.transcript as string) || "";
            if (t.trim()) setTranscript(t);
          }

          // Track AI text response
          if (event.type === "response.audio_transcript.done") {
            const t = (event.transcript as string) || "";
            if (t.trim()) setAiResponse(t);
          }

          // Handle function calls
          if (event.type === "response.function_call_arguments.done") {
            const {
              name,
              call_id: callId,
              arguments: argsStr,
            } = event as RealtimeEvent & {
              name: string;
              call_id: string;
              arguments: string;
            };

            if (name === "get_task_steps") {
              setToolCall("Looking up task instructions...");
              try {
                const args = JSON.parse(argsStr);
                const result = searchTaskDocs(args.task_description);

                dc.send(
                  JSON.stringify({
                    type: "conversation.item.create",
                    item: {
                      type: "function_call_output",
                      call_id: callId,
                      output: JSON.stringify(result),
                    },
                  }),
                );

                // Trigger model to continue speaking with the result
                dc.send(JSON.stringify({ type: "response.create" }));
              } catch (err) {
                console.error("[realtime] Function call error:", err);
              } finally {
                setTimeout(() => setToolCall(null), 2000);
              }
            }
          }

          // Log errors
          if (event.type === "error") {
            console.error("[realtime] Error event:", event);
            setError(
              (event.error as { message?: string })?.message ||
                JSON.stringify(event),
            );
          }
        } catch {
          // non-JSON message, ignore
        }
      });

      // 5. Create offer & connect via SDP
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch(
        "https://api.openai.com/v1/realtime/calls?model=gpt-realtime",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        },
      );

      if (!sdpRes.ok) {
        const txt = await sdpRes.text();
        throw new Error(`SDP negotiation failed: ${sdpRes.status} ${txt}`);
      }

      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      setStatus("Connected — waiting for data channel...");
    } catch (err: unknown) {
      console.error("startSession error:", err);
      setError(err instanceof Error ? err.message : String(err));
      cleanup();
    } finally {
      setIsConnecting(false);
    }
  }, [isActive, isConnecting, cleanup, startSnapshotLoop]);

  const stopSession = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSnapshotLoop();
      if (pcRef.current) {
        try {
          pcRef.current.close();
        } catch {}
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stopSnapshotLoop]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-950 text-zinc-100 p-4 gap-6">
      {/* Header */}
      <div className="w-full max-w-2xl text-center pt-6">
        <h1 className="text-2xl font-bold tracking-tight">
          🎙️ Realtime Vision + Voice
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Camera feed streamed at 1 FPS • Voice via WebRTC
        </p>
      </div>

      {/* Video Preview */}
      <div className="w-full max-w-2xl rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full aspect-video object-cover bg-black"
        />
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${
              isActive
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : isConnecting
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : "bg-zinc-700/50 text-zinc-400 border border-zinc-600/30"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
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
        {toolCall && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
              {toolCall}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-2xl flex gap-3">
        {!isActive ? (
          <button
            onClick={startSession}
            disabled={isConnecting}
            className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold transition-colors text-sm"
          >
            {isConnecting ? "Connecting..." : "Start Session"}
          </button>
        ) : (
          <>
            <button
              onClick={stopSession}
              className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors text-sm"
            >
              Stop Session
            </button>
            <button
              onClick={toggleMute}
              className={`h-12 px-4 rounded-xl font-semibold transition-colors text-sm ${
                isMuted
                  ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                  : "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
              }`}
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
          </>
        )}
      </div>

      {/* Text input */}
      {isActive && (
        <div className="w-full max-w-2xl flex gap-3">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendText(textInput);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 h-12 rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
          />
          <button
            onClick={() => sendText(textInput)}
            disabled={!textInput.trim()}
            className="h-12 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold transition-colors text-sm"
          >
            Send
          </button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="w-full max-w-2xl rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Transcripts */}
      {(transcript || aiResponse) && (
        <div className="w-full max-w-2xl space-y-3">
          {transcript && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <div className="text-xs text-zinc-500 mb-1 font-medium">
                🗣️ You said
              </div>
              <p className="text-sm text-zinc-300">{transcript}</p>
            </div>
          )}
          {aiResponse && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <div className="text-xs text-zinc-500 mb-1 font-medium">
                🤖 Assistant
              </div>
              <p className="text-sm text-zinc-300">{aiResponse}</p>
            </div>
          )}
        </div>
      )}

      {/* Event log (collapsed) */}
      {events.length > 0 && (
        <details className="w-full max-w-2xl">
          <summary className="cursor-pointer text-zinc-500 text-xs hover:text-zinc-300 transition-colors">
            Event log ({events.length})
          </summary>
          <div className="mt-2 rounded-xl bg-zinc-900 border border-zinc-800 p-3 max-h-64 overflow-y-auto space-y-1">
            {events.map((evt, i) => (
              <div key={i} className="text-[11px] font-mono text-zinc-500">
                <span className="text-zinc-400">{evt.type}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Hidden audio element for model voice playback */}
      <audio ref={audioRef} autoPlay className="hidden" />
    </div>
  );
}
