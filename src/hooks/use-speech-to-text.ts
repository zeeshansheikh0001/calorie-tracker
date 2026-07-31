"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  transcribeAudioBlob,
  warmupTranscriber,
} from "@/lib/speech/transcribe-audio";

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export type UseSpeechToTextOptions = {
  onFinal?: (transcript: string) => void;
  onError?: (message: string) => void;
};

/**
 * Simple tap-to-talk voice → text.
 * Records with MediaRecorder, then transcribes locally with Whisper tiny.
 */
export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const { onFinal, onError } = options;

  const onFinalRef = useRef(onFinal);
  const onErrorRef = useRef(onError);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  useEffect(() => {
    onFinalRef.current = onFinal;
    onErrorRef.current = onError;
  }, [onFinal, onError]);

  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined";
    setSupported(ok);
    if (ok) warmupTranscriber();
  }, []);

  const releaseStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else {
      releaseStream();
      setListening(false);
    }
  }, []);

  const start = useCallback(async () => {
    if (!supported || listening || transcribing) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        releaseStream();
        setListening(false);
        onErrorRef.current?.("Microphone recording failed. Try again.");
      };

      recorder.onstop = () => {
        setListening(false);
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        releaseStream();
        mediaRecorderRef.current = null;

        setTranscribing(true);
        void transcribeAudioBlob(blob)
          .then((text) => {
            onFinalRef.current?.(text);
          })
          .catch((err) => {
            onErrorRef.current?.(
              err instanceof Error ? err.message : "Voice transcription failed."
            );
          })
          .finally(() => {
            setTranscribing(false);
          });
      };

      recorder.start();
      setListening(true);
    } catch {
      releaseStream();
      setListening(false);
      onErrorRef.current?.(
        "Microphone access was blocked. Allow mic permission and try again."
      );
    }
  }, [listening, supported, transcribing]);

  const toggle = useCallback(() => {
    if (transcribing) return;
    if (listening) stop();
    else void start();
  }, [listening, start, stop, transcribing]);

  useEffect(() => {
    return () => {
      try {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
      } catch {
        /* ignore */
      }
      releaseStream();
    };
  }, []);

  return {
    supported,
    listening,
    /** Kept for API compatibility; local STT has no live interim text. */
    interim: "",
    transcribing,
    start,
    stop,
    toggle,
  };
}

function appendTranscript(current: string, next: string): string {
  const chunk = next.trim();
  if (!chunk) return current;
  const base = current.trimEnd();
  if (!base) return chunk.charAt(0).toUpperCase() + chunk.slice(1);
  const needsSpace = !/[\s([{/-]$/.test(base);
  return `${base}${needsSpace ? " " : ""}${chunk}`;
}

export { appendTranscript };
