import OpenAI from 'openai';

type JsonRecord = Record<string, unknown>;

const DEFAULT_NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const DEFAULT_NVIDIA_TEXT_MODEL = 'minimaxai/minimax-m2.7';
const DEFAULT_NVIDIA_VISION_MODEL = 'meta/llama-3.2-90b-vision-instruct';
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

export class NvidiaError extends Error {
  statusCode?: number;
  retryable: boolean;

  constructor(message: string, options?: {statusCode?: number; retryable?: boolean; cause?: unknown}) {
    super(message);
    this.name = 'NvidiaError';
    this.statusCode = options?.statusCode;
    this.retryable = options?.retryable ?? false;
    if (options?.cause !== undefined) {
      (this as Error & {cause?: unknown}).cause = options.cause;
    }
  }
}

function getNvidiaApiKey(): string | undefined {
  return process.env.NVIDIA_API_KEY?.trim() || undefined;
}

function getNvidiaBaseUrl(): string {
  return process.env.NVIDIA_BASE_URL?.trim() || DEFAULT_NVIDIA_BASE_URL;
}

function getNvidiaTextModel(): string {
  return process.env.NVIDIA_TEXT_MODEL?.trim() || process.env.NVIDIA_MODEL?.trim() || DEFAULT_NVIDIA_TEXT_MODEL;
}

function getNvidiaVisionModel(): string {
  return process.env.NVIDIA_VISION_MODEL?.trim() || process.env.NVIDIA_MODEL?.trim() || DEFAULT_NVIDIA_VISION_MODEL;
}

function getStatusCode(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null) return undefined;
  const withStatus = err as {status?: unknown; statusCode?: unknown};
  if (typeof withStatus.status === 'number') return withStatus.status;
  if (typeof withStatus.statusCode === 'number') return withStatus.statusCode;
  return undefined;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function getApiErrorDetails(err: unknown): {statusCode?: number; message: string} {
  const statusCode = getStatusCode(err);
  const fallbackMessage = getErrorMessage(err);

  if (typeof err !== 'object' || err === null) {
    return {statusCode, message: fallbackMessage};
  }

  const withError = err as {
    error?: {message?: unknown; code?: unknown; type?: unknown};
    message?: unknown;
  };

  const apiMessage =
    typeof withError.error?.message === 'string'
      ? withError.error.message
      : typeof withError.message === 'string'
        ? withError.message
        : fallbackMessage;

  const code = typeof withError.error?.code === 'string' ? withError.error.code : undefined;
  const type = typeof withError.error?.type === 'string' ? withError.error.type : undefined;
  const suffix = [code, type].filter(Boolean).join('/');
  const message = suffix ? `${apiMessage} (${suffix})` : apiMessage;

  return {statusCode, message};
}

function isRetryable(statusCode: number | undefined, message: string): boolean {
  if (statusCode !== undefined && RETRYABLE_STATUS_CODES.has(statusCode)) return true;
  const lower = message.toLowerCase();
  return (
    lower.includes('rate limit') ||
    lower.includes('quota') ||
    lower.includes('temporar') ||
    lower.includes('timeout') ||
    lower.includes('overload') ||
    lower.includes('unavailable')
  );
}

function stripCodeFence(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

function parseJsonPayload(raw: string): JsonRecord {
  const cleaned = stripCodeFence(raw);
  const parsed = JSON.parse(cleaned) as unknown;
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('NVIDIA response is not a JSON object.');
  }
  return parsed as JsonRecord;
}

function getClient(): OpenAI {
  const apiKey = getNvidiaApiKey();
  if (!apiKey) {
    throw new NvidiaError('NVIDIA API key missing.', {statusCode: 401, retryable: false});
  }
  return new OpenAI({
    apiKey,
    baseURL: getNvidiaBaseUrl(),
  });
}

export function isNvidiaConfigured(): boolean {
  return Boolean(getNvidiaApiKey());
}

export function getNvidiaRuntimeConfig(): {
  baseUrl: string;
  textModel: string;
  visionModel: string;
  hasApiKey: boolean;
} {
  return {
    baseUrl: getNvidiaBaseUrl(),
    textModel: getNvidiaTextModel(),
    visionModel: getNvidiaVisionModel(),
    hasApiKey: isNvidiaConfigured(),
  };
}

export async function analyzeFoodTextWithNvidia(params: {
  description: string;
  systemPrompt: string;
}): Promise<JsonRecord> {
  const client = getClient();

  try {
    const model = getNvidiaTextModel();
    const response = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        {role: 'system', content: params.systemPrompt},
        {role: 'user', content: `Food description: ${params.description}`},
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new Error('NVIDIA returned no content.');
    return parseJsonPayload(content);
  } catch (err) {
    const {statusCode, message} = getApiErrorDetails(err);
    console.error('[NVIDIA][text] request failed', {
      statusCode,
      baseUrl: getNvidiaBaseUrl(),
      model: getNvidiaTextModel(),
      message,
    });
    throw new NvidiaError(`NVIDIA text analysis failed: ${message}`, {
      statusCode,
      retryable: isRetryable(statusCode, message),
      cause: err,
    });
  }
}

export async function analyzeFoodPhotoWithNvidia(params: {
  photoDataUri: string;
  systemPrompt: string;
}): Promise<JsonRecord> {
  const client = getClient();

  try {
    const model = getNvidiaVisionModel();
    const response = await client.chat.completions.create({
      model,
      temperature: 0.1,
      messages: [
        {role: 'system', content: params.systemPrompt},
        {
          role: 'user',
          content: [
            {type: 'text', text: 'Analyze this food photo and return only valid JSON.'},
            {
              type: 'image_url',
              image_url: {
                url: params.photoDataUri,
              },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new Error('NVIDIA returned no content.');
    return parseJsonPayload(content);
  } catch (err) {
    const {statusCode, message} = getApiErrorDetails(err);
    console.error('[NVIDIA][photo] request failed', {
      statusCode,
      baseUrl: getNvidiaBaseUrl(),
      model: getNvidiaVisionModel(),
      message,
    });
    throw new NvidiaError(`NVIDIA photo analysis failed: ${message}`, {
      statusCode,
      retryable: isRetryable(statusCode, message),
      cause: err,
    });
  }
}
