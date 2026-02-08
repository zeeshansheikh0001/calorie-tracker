# API Keys & Environment Variables

This app uses the following keys. Only **Gemini** is required for AI features (manual food analysis, photo analysis, diet charts, etc.).

## AI (required for “Analyze with AI” and related features)

| Variable | Used for | Free key / where to get it |
|----------|----------|----------------------------|
| **GEMINI_API_KEY** (or **GOOGLE_API_KEY** or **GOOGLE_GENAI_API_KEY**) | All AI: food text/photo analysis, diet chart, health schedule, daily log summary | **Google AI Studio** (free tier): https://aistudio.google.com/apikey — Create a key and copy it. No credit card for free tier. |

- Set **one** of these in Vercel: **Project → Settings → Environment Variables** (e.g. `GEMINI_API_KEY`), then **redeploy**.
- The app currently uses **only Google Gemini** for AI. Other providers (e.g. OpenAI) are not wired in.

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
3. This app uses **gemini-1.5-flash** by default so you get a separate quota from gemini-2.0-flash. If one model is exhausted, the other may still work after redeploy.
4. If you need more quota: enable **billing** in Google Cloud (pay-as-you-go) for the project that owns the API key, or wait until the next day (Pacific) for the free daily quota to reset.
