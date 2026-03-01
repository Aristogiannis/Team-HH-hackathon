"use client";

import { type DenoiseState, Rnnoise } from "@shiguredo/rnnoise-wasm";
import { useCallback, useRef } from "react";

/**
 * Result returned from initializing the audio pipeline
 */
export interface AudioPipelineResult {
  /** The processed MediaStream (with noise cancellation if available) */
  processedStream: MediaStream;
  /** Whether RNNoise noise cancellation is active */
  noiseCancellationActive: boolean;
}

/**
 * useAudioPipeline
 *
 * Manages the RNNoise-based noise cancellation pipeline.
 * Accepts a raw MediaStream, returns a processed one with background noise removed.
 * Falls back to the raw stream if RNNoise fails to load.
 */
export function useAudioPipeline() {
  const rnnoiseStateRef = useRef<DenoiseState | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const destinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(
    null,
  );
  const audioContextRef = useRef<AudioContext | null>(null);

  /**
   * Initialize the audio pipeline with RNNoise noise cancellation.
   * Falls back to the raw stream if RNNoise can't be loaded.
   */
  const initializePipeline = useCallback(
    async (rawStream: MediaStream): Promise<AudioPipelineResult> => {
      try {
        console.log("[audio-pipeline] Loading RNNoise…");
        const rnnoise = await Rnnoise.load();
        const denoiseState = rnnoise.createDenoiseState();
        rnnoiseStateRef.current = denoiseState;

        // RNNoise requires 48 kHz
        const audioContext = new AudioContext({ sampleRate: 48000 });
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(rawStream);
        sourceNodeRef.current = source;

        const destination = audioContext.createMediaStreamDestination();
        destinationNodeRef.current = destination;

        // ScriptProcessor with 4096 buffer; we chunk internally into 480-sample frames
        const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current = scriptProcessor;

        // Buffers for the 480-sample frame boundary RNNoise expects
        const inputFrameBuffer = new Float32Array(480);
        const outputFrameBuffer = new Float32Array(480);
        let inputFrameIndex = 0;
        let outputFrameIndex = 0;
        let hasProcessedFrame = false;

        scriptProcessor.onaudioprocess = (event) => {
          const inputData = event.inputBuffer.getChannelData(0);
          const outputData = event.outputBuffer.getChannelData(0);

          for (let i = 0; i < inputData.length; i++) {
            inputFrameBuffer[inputFrameIndex++] = inputData[i];

            // When we have a full 480-sample frame, run RNNoise
            if (inputFrameIndex === 480) {
              try {
                denoiseState.processFrame(inputFrameBuffer);
                outputFrameBuffer.set(inputFrameBuffer);
                hasProcessedFrame = true;
              } catch (err) {
                console.warn("[audio-pipeline] processFrame error:", err);
                outputFrameBuffer.set(inputFrameBuffer);
              }
              inputFrameIndex = 0;
              outputFrameIndex = 0;
            }

            // Write from the last processed frame (silence until first frame ready)
            outputData[i] = hasProcessedFrame
              ? outputFrameBuffer[outputFrameIndex++]
              : 0;

            if (outputFrameIndex === 480) {
              outputFrameIndex = 0;
            }
          }
        };

        // Wire up: source → scriptProcessor → destination
        source.connect(scriptProcessor);
        scriptProcessor.connect(destination);

        console.log("[audio-pipeline] RNNoise noise cancellation enabled");

        return {
          processedStream: destination.stream,
          noiseCancellationActive: true,
        };
      } catch (err) {
        console.warn(
          "[audio-pipeline] RNNoise unavailable, using raw audio:",
          err,
        );
        return {
          processedStream: rawStream,
          noiseCancellationActive: false,
        };
      }
    },
    [],
  );

  /**
   * Tear down all audio nodes, context, and RNNoise state.
   */
  const cleanupPipeline = useCallback(async () => {
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current.onaudioprocess = null;
      } catch {}
      scriptProcessorRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {}
      sourceNodeRef.current = null;
    }

    if (destinationNodeRef.current) {
      try {
        destinationNodeRef.current.disconnect();
      } catch {}
      destinationNodeRef.current = null;
    }

    if (rnnoiseStateRef.current) {
      try {
        rnnoiseStateRef.current.destroy();
      } catch {}
      rnnoiseStateRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        await audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
  }, []);

  return {
    initializePipeline,
    cleanupPipeline,
  };
}
