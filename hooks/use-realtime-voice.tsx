"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchTaskDocs } from "../lib/search-tasks";
import { useAudioPipeline } from "./use-audio-pipeline";

export type RealtimeEvent = {
  type: string;
  [key: string]: unknown;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: number;
};

export interface UseRealtimeVoiceReturn {
  // State
  isActive: boolean;
  isConnecting: boolean;
  error: string | null;
  status: string;
  messages: ChatMessage[];
  events: RealtimeEvent[];
  isMuted: boolean;
  toolCall: string | null;
  noiseCancellation: boolean;

  // Actions
  startSession: () => Promise<void>;
  stopSession: () => void;
  toggleMute: () => void;
  sendText: (text: string) => void;

  // Refs the page must attach to DOM elements
  videoRef: React.RefObject<HTMLVideoElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

let messageCounter = 0;
function nextMessageId(): string {
  messageCounter += 1;
  return `msg-${Date.now()}-${messageCounter}`;
}

function pushMessage(
  setter: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  role: ChatMessage["role"],
  text: string,
) {
  setter((prev) => [
    ...prev,
    { id: nextMessageId(), role, text, timestamp: Date.now() },
  ]);
}

// ── Manager dashboard forwarding ───────────────────────────────────
const MANAGER_API = "/api/transcripts";
const ENGINEER_ID = "eng-1";
const ENGINEER_NAME = "Aristogiannis";

function forwardToManager(role: string, text: string) {
  fetch(MANAGER_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      engineerId: ENGINEER_ID,
      engineerName: ENGINEER_NAME,
      role,
      text,
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {}); // fire and forget
}

// ── Event type helpers (stable – defined outside the component) ────
function isUserTranscriptEvent(event: RealtimeEvent): boolean {
  return event.type === "conversation.item.input_audio_transcription.completed";
}

function isAiResponseEvent(event: RealtimeEvent): boolean {
  return (
    event.type === "response.audio_transcript.done" ||
    event.type === "response.output_audio_transcript.done"
  );
}

function isFunctionCallEvent(event: RealtimeEvent): boolean {
  return event.type === "response.function_call_arguments.done";
}

function isNoisyEvent(event: RealtimeEvent): boolean {
  return (
    event.type === "response.audio.delta" ||
    event.type === "response.audio.done"
  );
}

function isErrorEvent(event: RealtimeEvent): boolean {
  return event.type === "error";
}

export function useRealtimeVoice(): UseRealtimeVoiceReturn {
  // ── State ──────────────────────────────────────────────────────────
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [toolCall, setToolCall] = useState<string | null>(null);
  const [noiseCancellation, setNoiseCancellation] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const snapshotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // ── Audio pipeline (RNNoise noise cancellation) ────────────────────
  const { initializePipeline, cleanupPipeline } = useAudioPipeline();

  // ── Frame capture ──────────────────────────────────────────────────
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

  // ── Send a single frame over the data channel ─────────────────────
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

  // ── Snapshot loop (1 FPS) ──────────────────────────────────────────
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

  // ── Toggle microphone mute ────────────────────────────────────────
  // Toggling the raw stream's audio track stops data flowing into the
  // RNNoise pipeline, effectively muting both raw and processed output.
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
  }, []);

  // ── Send a text message via the data channel ──────────────────────
  const sendText = useCallback((text: string) => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open" || !text.trim()) return;

    const trimmed = text.trim();

    // Add the user message to the conversation log
    pushMessage(setMessages, "user", trimmed);

    dc.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: trimmed }],
        },
      }),
    );
    dc.send(JSON.stringify({ type: "response.create" }));
  }, []);

  // ── Cleanup everything ────────────────────────────────────────────
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

    // Tear down the RNNoise audio processing pipeline
    cleanupPipeline();
    setNoiseCancellation(false);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => {
        t.stop();
      });
      localStreamRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }

    setIsActive(false);
    setStatus("Idle");
  }, [stopSnapshotLoop, cleanupPipeline]);

  // ── Start the session ─────────────────────────────────────────────
  const startSession = useCallback(async () => {
    if (isActive || isConnecting) return;
    setIsConnecting(true);
    setError(null);
    setMessages([]);
    setEvents([]);
    setIsMuted(false);
    setNoiseCancellation(false);
    setStatus("Requesting camera & mic...");

    try {
      // 1. Get user media (video + audio)
      const rawStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 } },
        audio: true,
      });
      localStreamRef.current = rawStream;

      // Show video preview (always uses the raw stream for the camera feed)
      if (videoRef.current) {
        videoRef.current.srcObject = rawStream;
      }

      // 2. Run audio through RNNoise noise cancellation pipeline
      setStatus("Initialising noise cancellation...");
      const { processedStream, noiseCancellationActive } =
        await initializePipeline(rawStream);
      setNoiseCancellation(noiseCancellationActive);

      // Pick the audio track to send over WebRTC — noise-cancelled if available,
      // otherwise the raw mic track.
      const audioTrackForPeer = noiseCancellationActive
        ? processedStream.getAudioTracks()[0]
        : rawStream.getAudioTracks()[0];

      // 3. Get ephemeral key from our backend
      setStatus("Getting session token...");
      const tokenRes = await fetch("/api/session");
      if (!tokenRes.ok) {
        const detail = await tokenRes.text();
        throw new Error(`Token request failed: ${detail}`);
      }
      const { value: ephemeralKey } = await tokenRes.json();
      if (!ephemeralKey) throw new Error("No ephemeral key received");

      // 4. Create peer connection
      setStatus("Establishing WebRTC connection...");
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Play remote audio (model's voice)
      pc.ontrack = (e) => {
        if (audioRef.current) {
          audioRef.current.srcObject = e.streams[0];
        }
      };

      // Add the (possibly noise-cancelled) audio track to the peer connection
      if (audioTrackForPeer) {
        pc.addTrack(audioTrackForPeer, processedStream);
      }

      // 5. Create data channel
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.addEventListener("open", async () => {
        console.log("[dc] Data channel open");
        setIsActive(true);
        setStatus(
          noiseCancellationActive
            ? "Connected — streaming (noise cancellation on)"
            : "Connected — streaming",
        );

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
          if (!isNoisyEvent(event)) {
            setEvents((prev) => [event, ...prev].slice(0, 50));
          }

          // Track user transcript (voice → text)
          if (isUserTranscriptEvent(event)) {
            const t = (event.transcript as string) || "";
            if (t.trim()) {
              pushMessage(setMessages, "user", t.trim());
              forwardToManager("user", t.trim());
            }
          }

          // Track AI response transcript (covers both event type variants)
          if (isAiResponseEvent(event)) {
            const t = (event.transcript as string) || "";
            if (t.trim()) {
              pushMessage(setMessages, "assistant", t.trim());
              forwardToManager("assistant", t.trim());
            }
          }

          // Handle function calls (async — searchTaskDocs calls the embed API)
          if (isFunctionCallEvent(event)) {
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
              pushMessage(
                setMessages,
                "system",
                "🔍 Looking up task instructions…",
              );
              forwardToManager("system", "Looking up task instructions...");

              // Wrap in async IIFE — the message handler itself isn't async
              (async () => {
                let args: { task_description?: string } = {};
                try {
                  args = JSON.parse(argsStr);
                } catch (parseErr) {
                  console.error(
                    "[realtime] Failed to parse tool args:",
                    argsStr,
                    parseErr,
                  );
                }

                const query = args.task_description ?? "";
                console.log(
                  "[realtime] get_task_steps called with:",
                  JSON.stringify(query),
                );

                try {
                  const result = await searchTaskDocs(query);
                  console.log(
                    "[realtime] searchTaskDocs result:",
                    JSON.stringify({
                      found: result.found,
                      title: result.title,
                      matchMethod: result.matchMethod,
                      similarity: result.similarity,
                      stepsLength: result.steps?.length,
                      alternatives: result.alternatives,
                    }),
                  );

                  const statusMsg = result.found
                    ? `Found: ${result.title} (via ${result.matchMethod}${result.similarity != null ? `, sim=${result.similarity.toFixed(3)}` : ""})`
                    : `No match for "${query}"`;
                  pushMessage(
                    setMessages,
                    "system",
                    result.found ? `✅ ${statusMsg}` : `❌ ${statusMsg}`,
                  );
                  forwardToManager("system", statusMsg);

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
                  // Send error back to the model so it can recover gracefully
                  const errorResult = {
                    found: false,
                    steps: `Internal error running search for "${query}". Ask the user to rephrase their request.`,
                    error: String(err),
                  };
                  try {
                    dc.send(
                      JSON.stringify({
                        type: "conversation.item.create",
                        item: {
                          type: "function_call_output",
                          call_id: callId,
                          output: JSON.stringify(errorResult),
                        },
                      }),
                    );
                    dc.send(JSON.stringify({ type: "response.create" }));
                  } catch (sendErr) {
                    console.error(
                      "[realtime] Failed to send error output:",
                      sendErr,
                    );
                  }
                } finally {
                  setTimeout(() => setToolCall(null), 2000);
                }
              })();
            }
          }

          // Log errors
          if (isErrorEvent(event)) {
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

      // 6. Create offer & connect via SDP
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
  }, [
    isActive,
    isConnecting,
    cleanup,
    sendFrame,
    startSnapshotLoop,
    initializePipeline,
  ]);

  const stopSession = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // ── Cleanup on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopSnapshotLoop();
      cleanupPipeline();
      if (pcRef.current) {
        try {
          pcRef.current.close();
        } catch {}
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => {
          t.stop();
        });
      }
    };
  }, [stopSnapshotLoop, cleanupPipeline]);

  // ── Public API ────────────────────────────────────────────────────
  return {
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
  };
}
