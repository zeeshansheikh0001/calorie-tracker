# API Keys & Environment Variables

You need **at least one** AI provider for “Analyze with AI” and related features: **Gemini** (default) or **OpenAI** (optional).

## AI – Option A: Google Gemini (default)

| Variable | Used for | Free key / where to get it |
|----------|----------|----------------------------|
| **GEMINI_API_KEY** (or **GOOGLE_API_KEY** or **GOOGLE_GENAI_API_KEY**) | All AI: food text/photo analysis, diet chart, health schedule, daily log summary | **Google AI Studio** (free tier): https://aistudio.google.com/apikey — Create a key. No credit card for free tier. |

- **AI_MODEL** (optional): Primary Google model for manual analysis. Default is `gemini-2.0-flash`.
- **AI_MODEL_CANDIDATES** (optional): Comma-separated model retry list for manual analysis. Example: `gemini-2.0-flash,gemini-2.0-flash-lite,gemma-3-27b-it`.
  - The app now retries across this list when a model is unavailable (404) or quota-limited (429).
  - You can include Gemma model IDs here if your Google key/project has access to them.

## AI – Option B: OpenAI (for “Analyze with AI” only)

To use **OpenAI** instead of Gemini for manual food analysis (log-food/manual), set:

| Variable | Used for |
|----------|----------|
| **AI_PROVIDER** | Set to `openai` (case-insensitive). |
| **OPENAI_API_KEY** | Your OpenAI API key. |
| **OPENAI_MODEL** (optional) | Model to use; default is `gpt-4o-mini`. |

- **Where to get OpenAI key:** https://platform.openai.com/api-keys — free tier has limited credits; then pay-as-you-go.
- When **AI_PROVIDER=openai** and **OPENAI_API_KEY** are set, the app uses OpenAI for “Analyze with AI” and ignores Gemini for that flow. Other AI features (photo analysis, diet chart, etc.) still use Gemini if configured.

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
3. Set **AI_MODEL_CANDIDATES** to rotate free Google models on failure (example: `gemini-2.0-flash,gemini-2.0-flash-lite,gemma-3-27b-it`). The app tries the next model on 404/429 errors.
4. If you need more quota: enable **billing** in Google Cloud (pay-as-you-go) for the project that owns the API key, or wait until the next day (Pacific) for the free daily quota to reset.
