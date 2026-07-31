"use client";

/**
 * Browser-side Whisper (tiny.en) — no Chrome cloud speech service required.
 * Must stay client-only so onnxruntime-node is never traced into Vercel functions.
 */

type AsrResult = { text?: string } | string;

type AsrPipeline = (audio: Float32Array) => Promise<AsrResult>;

let pipelinePromise: Promise<AsrPipeline> | null = null;

async function getPipeline(): Promise<AsrPipeline> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      // Client-only: WASM backend (never onnxruntime-node / native).
      const { env, pipeline } = await import("@huggingface/transformers");
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      try {
        // Prefer WASM so Node native bindings are never required.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (env as any).backends?.onnx?.setPriority?.(["wasm"]);
      } catch {
        /* older transformers builds may not expose backends */
      }

      // q8 is broken on transformers.js 4.2 + ORT 1.25 (MatMulNBits scale error).
      // fp32 loads reliably for whisper-tiny.en in the browser.
      return (await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-tiny.en",
        { dtype: "fp32", device: "wasm" }
      )) as AsrPipeline;
    })().catch((err) => {
      pipelinePromise = null;
      throw err;
    });
  }
  return pipelinePromise;
}

/** Decode a recorded Blob to mono PCM at 16 kHz for Whisper. */
export async function blobToWhisperAudio(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext({ sampleRate: 16000 });
  try {
    const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    return decoded.getChannelData(0);
  } finally {
    await audioCtx.close().catch(() => undefined);
  }
}

export async function transcribeAudioBlob(blob: Blob): Promise<string> {
  if (blob.size < 256) {
    throw new Error("Recording was too short. Tap mic, speak, then stop.");
  }

  const audio = await blobToWhisperAudio(blob);
  if (audio.length < 1600) {
    throw new Error("Recording was too short. Tap mic, speak, then stop.");
  }

  try {
    const asr = await getPipeline();
    // whisper-tiny.en is English-only — do not pass language/task.
    const result = await asr(audio);
    const text = typeof result === "string" ? result : (result.text ?? "");
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (!cleaned) {
      throw new Error("Couldn’t hear that. Try speaking again.");
    }
    return cleaned;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/Can't create a session|onnx|qdq_actions|MatMulNBits/i.test(message)) {
      throw new Error(
        "Voice model failed to load. Refresh the page and try again."
      );
    }
    throw err instanceof Error ? err : new Error(message);
  }
}

/** Prefetch Whisper weights in the background after the page loads. */
export function warmupTranscriber(): void {
  void getPipeline().catch(() => {
    /* first mic tap will retry */
  });
}
