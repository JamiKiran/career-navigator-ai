# Cloudflare Pages Deployment

## Recommended: Git integration

1. Open Cloudflare **Workers & Pages** and create a Pages application.
2. Import `JamiKiran/career-navigator-ai` from GitHub.
3. Use production branch `main`.
4. Use build command `exit 0`.
5. Use build output directory `.`.
6. Deploy and record the generated `career-navigator-ai.pages.dev` address.
7. Add that address and `https://career-navigator-ai.pages.dev/?app=1` to Supabase Authentication redirect URLs.

Cloudflare will automatically deploy future pushes and produce preview deployments. The project includes security headers and an `/app` redirect.

## Direct upload alternative

```bash
npx wrangler login
npx wrangler pages deploy . --project-name career-navigator-ai
```

Direct Upload projects cannot later be converted to Git integration; create a new project if you want to change deployment type.
