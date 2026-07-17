# Career Navigator AI — Real Cloud Setup

The application contains a production-oriented Supabase schema, Row Level Security policies, private evidence storage, passwordless authentication and a server-side OpenAI agent function. Until the following configuration is completed, the public application intentionally shows **Local mode**.

## 1. Create the Supabase project

1. Create a Supabase project in the required region.
2. Install the Supabase CLI and authenticate.
3. From this repository, link and apply the schema:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## 2. Configure server secrets

Never put these values in `config.js` or GitHub:

```bash
supabase secrets set OPENAI_API_KEY=YOUR_OPENAI_API_KEY
supabase secrets set OPENAI_MODEL_SOL=gpt-5.6-sol
supabase secrets set OPENAI_MODEL_TERRA=gpt-5.6-terra
supabase secrets set OPENAI_MODEL_LUNA=gpt-5.6-luna
supabase functions deploy agent
```

The agent uses the OpenAI Responses API from the server-side Edge Function. The OpenAI key is never sent to the browser.

## 3. Configure the public client

Copy the project URL and **public anonymous key** from Supabase project settings into `config.js`:

```js
window.CAREER_NAV_CONFIG = {
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_PUBLIC_ANON_KEY'
};
```

The anonymous key may be public because database access is controlled through authentication and Row Level Security. Never use the Supabase service-role key in browser code.

## 4. Authentication settings

Add these redirect URLs in Supabase Authentication:

- `https://jamikiran.github.io/career-navigator-ai/`
- `https://jamikiran.github.io/career-navigator-ai/?app=1`
- Your localhost URL during development

Enable email OTP/magic-link authentication and customize the email template if desired.

## 5. Production checks

- Verify cross-user data isolation.
- Restrict Edge Function CORS to the production origin.
- Configure rate limits and abuse protection.
- Complete privacy, retention and consent review.
- Add OpenAI usage limits and monitoring.
- Run security, accessibility and agent-quality evaluations before public onboarding.

## 6. Deploy the frontend to Cloudflare Pages

The repository includes `wrangler.toml`, `_headers`, `_redirects` and `.cfignore`.

Direct upload:

```bash
npx wrangler login
npx wrangler pages deploy . --project-name career-navigator-ai
```

Alternatively, connect the GitHub repository to Cloudflare Pages with production branch `main`, build command `exit 0` and output directory `.`. Add the final `*.pages.dev` URL to the Supabase authentication redirect allow-list.
