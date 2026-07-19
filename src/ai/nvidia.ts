import OpenAI from "openai";
import type { z } from "zod";

const DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";
const DEFAULT_TEXT_MODEL = "openai/gpt-oss-20b";
const DEFAULT_VISION_MODEL = "nvidia/llama-3.1-nemotron-nano-vl-8b-v1";

export function getNvidiaClient() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error(
      "NVIDIA_API_KEY is not set. Add it to .env.local (NVIDIA NIM / build.nvidia.com)."
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.NVIDIA_BASE_URL || DEFAULT_BASE_URL,
  });
}

export function getTextModel() {
  return (
    process.env.NVIDIA_TEXT_MODEL ||
    process.env.NVIDIA_MODEL ||
    DEFAULT_TEXT_MODEL
  );
}

export function getVisionModel() {
  return process.env.NVIDIA_VISION_MODEL || DEFAULT_VISION_MODEL;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // continue
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return JSON.parse(fenced[1].trim());
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }

  throw new Error("NVIDIA model did not return valid JSON.");
}

type NvidiaGenerateJsonArgs<T> = {
  schema: z.ZodType<T>;
  system: string;
  user: string;
  /** data URI for vision models */
  imageDataUri?: string;
  temperature?: number;
};

/**
 * OpenAI-compatible chat completion against NVIDIA NIM.
 * Text → NVIDIA_TEXT_MODEL; image → NVIDIA_VISION_MODEL.
 */
export async function nvidiaGenerateJson<T>({
  schema,
  system,
  user,
  imageDataUri,
  temperature = 0.2,
}: NvidiaGenerateJsonArgs<T>): Promise<T> {
  const client = getNvidiaClient();
  const model = imageDataUri ? getVisionModel() : getTextModel();

  const userContent: OpenAI.Chat.ChatCompletionUserMessageParam["content"] =
    imageDataUri
      ? [
          { type: "image_url", image_url: { url: imageDataUri } },
          { type: "text", text: user },
        ]
      : user;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `${system}

You must respond with ONLY a single valid JSON object (no markdown fences, no commentary) that matches the requested schema.`,
    },
    { role: "user", content: userContent },
  ];

  const request = async (withJsonFormat: boolean) =>
    client.chat.completions.create({
      model,
      temperature,
      messages,
      ...(withJsonFormat && !imageDataUri
        ? { response_format: { type: "json_object" as const } }
        : {}),
    });

  let completion;
  try {
    completion = await request(!imageDataUri);
  } catch (firstError) {
    try {
      // Some NIM models reject response_format — retry plain chat.
      completion = await request(false);
    } catch (secondError) {
      throw toNvidiaUserError(secondError ?? firstError);
    }
  }

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error("NVIDIA model returned an empty response.");
  }

  const parsed = extractJson(text);
  return schema.parse(parsed);
}

function toNvidiaUserError(error: unknown): Error {
  const status =
    typeof error === "object" &&
    error &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : undefined;

  const detail =
    typeof error === "object" &&
    error &&
    "error" in error &&
    typeof (error as { error?: { detail?: unknown } }).error?.detail === "string"
      ? (error as { error: { detail: string } }).error.detail
      : undefined;

  if (status === 403) {
    return new Error(
      "NVIDIA API authorization failed (403). Your key can list models but cannot run inference. " +
        "On build.nvidia.com open a model page → Get API Key, enable “Public API Endpoints”, " +
        "put the new key in .env.local as NVIDIA_API_KEY, then restart the server."
    );
  }

  if (status === 401) {
    return new Error(
      "NVIDIA API key is invalid (401). Generate a new key on build.nvidia.com and update .env.local."
    );
  }

  const message =
    error instanceof Error ? error.message : "NVIDIA request failed.";
  return new Error(detail ? `${message}: ${detail}` : message);
}
