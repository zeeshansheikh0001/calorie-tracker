# API Keys & Environment Variables

You need **at least one** AI provider for “Analyze with AI” and related features: **Gemini** (default), **NVIDIA NIM** (fallback), or **OpenAI** (optional for manual text flow).

## AI – Option A: Google Gemini (default)

| Variable | Used for | Free key / where to get it |
|----------|----------|----------------------------|
| **GEMINI_API_KEY** (or **GOOGLE_API_KEY** or **GOOGLE_GENAI_API_KEY**) | All AI: food text/photo analysis, diet chart, health schedule, daily log summary | **Google AI Studio** (free tier): https://aistudio.google.com/apikey — Create a key. No credit card for free tier. |

- **AI_MODEL** (optional): Override the Gemini model. Default is `gemini-2.0-flash`. Examples: `gemini-2.5-flash`, `gemini-2.0-flash-lite`. Avoid `gemini-1.5-flash` (can 404 on some API versions).

## AI – Option B: OpenAI (for “Analyze with AI” only)

To use **OpenAI** instead of Gemini for manual food analysis (log-food/manual), set:

| Variable | Used for |
|----------|----------|
| **AI_PROVIDER** | Set to `openai` (case-insensitive). |
| **OPENAI_API_KEY** | Your OpenAI API key. |
| **OPENAI_MODEL** (optional) | Model to use; default is `gpt-4o-mini`. |

- **Where to get OpenAI key:** https://platform.openai.com/api-keys — free tier has limited credits; then pay-as-you-go.
- When **AI_PROVIDER=openai** and **OPENAI_API_KEY** are set, the app uses OpenAI for “Analyze with AI” and ignores Gemini for that flow. Other AI features (photo analysis, diet chart, etc.) still use Gemini if configured.

## AI – Option C: NVIDIA NIM (automatic fallback for text + photo)

If configured, Gemini remains primary and NVIDIA is used automatically when Gemini fails due to quota, transient provider issues, or auth/config issues.

| Variable | Used for |
|----------|----------|
| **NVIDIA_API_KEY** | Auth key for NVIDIA NIM API |
| **NVIDIA_BASE_URL** (optional) | Defaults to `https://integrate.api.nvidia.com/v1` |
| **NVIDIA_MODEL** (optional) | Global fallback model override |
| **NVIDIA_TEXT_MODEL** (optional) | Text analysis model override |
| **NVIDIA_VISION_MODEL** (optional) | Photo/camera analysis model override |

- Get key: https://build.nvidia.com/models
- Example text model: `minimaxai/minimax-m2.7`
- Example vision model: `meta/llama-3.2-90b-vision-instruct`
- If `NVIDIA_API_KEY` is missing, the app keeps Gemini-only behavior.

## Other keys (optional, for other features)

| Variable | Used for | Free tier / where |
|----------|----------|-------------------|
| **NEXT_PUBLIC_SUPABASE_URL**, **NEXT_PUBLIC_SUPABASE_ANON_KEY**, **SUPABASE_SECRET_KEY** | Auth / database (if you enable Supabase) | https://supabase.com — free tier |
| **NEXT_PUBLIC_VAPID_PUBLIC_KEY**, **VAPID_PRIVATE_KEY**, **VAPID_EMAIL** | Web push notifications | Generate with `npm run generate-vapid` (see scripts in package.json) |
| **NEXT_PUBLIC_FIREBASE_*** | Firebase (e.g. messaging) | https://console.firebase.google.com — free tier |

## Fixing the 500 on “Analyze with AI”

1. Get a free Gemini key: https://aistudio.google.com/apikey  
2. In **Vercel** → your project → **Settings** → **Environment Variables**: add `GEMINI_API_KEY` = your key.  
3. **Redeploy** (Deployments → … → Redeploy, or push a new commit).

After that, the POST to `/log-food/manual` and “Analyze with AI” should work in production.

## Rate limits (429 “quota exceeded”)

The Gemini **free tier** has limits per model, for example:

- **Requests per minute (RPM):** e.g. 10–15 (varies by model)
- **Requests per day (RPD):** e.g. 250–1,500 (varies by model)
- **Daily reset:** midnight Pacific Time

If you see **429 Too Many Requests** or “quota exceeded”:

1. **Wait ~1 minute** and try again (per-minute limit resets quickly).
2. **Check usage:** [Google AI Studio](https://aistudio.google.com/) or [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).
3. This app uses **gemini-2.0-flash** by default, with fallback to **gemini-2.0-flash-lite** for model-availability issues.
4. If `NVIDIA_API_KEY` is configured, text + photo analysis automatically fallback to NVIDIA when Gemini fails.
5. If you need more quota: enable **billing** in Google Cloud (pay-as-you-go) for the project that owns the API key, or wait until the next day (Pacific) for the free daily quota to reset.

## Fallback Order (text + photo + camera)

1. Gemini primary model (`AI_MODEL` or default `gemini-2.0-flash`)
2. Gemini fallback model (`gemini-2.0-flash-lite`) for text analysis
3. NVIDIA NIM fallback (if `NVIDIA_API_KEY` is configured)
4. User-friendly error message if both providers fail

## NVIDIA Debug (curl)

If you see `NVIDIA rejected the request (auth/model access)`, test your key/model directly first:

```bash
curl -i https://integrate.api.nvidia.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NVIDIA_API_KEY" \
  -d '{
    "model": "minimaxai/minimax-m2.7",
    "messages": [{"role":"user","content":"Reply with OK"}],
    "temperature": 0.2,
    "max_tokens": 16
  }'
```

For photo/camera model access checks (vision):

```bash
curl -i https://integrate.api.nvidia.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NVIDIA_API_KEY" \
  -d '{
    "model": "meta/llama-3.2-90b-vision-instruct",
    "messages": [{"role":"user","content":[{"type":"text","text":"Reply with OK"}]}],
    "max_tokens": 32
  }'
```

Interpretation:

- **200**: key + model are valid.
- **401/403**: key invalid, expired, or your account is not entitled to that model.
- **404**: model ID unsupported/typo.
- **429**: rate limit/quota.
