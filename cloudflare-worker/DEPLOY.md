# Deploy Career Navigator AI

## Complete Worker deployment

Extract the project ZIP, open a terminal in the `cloudflare-worker` folder,
then run:

1. `npm install`
2. `npx wrangler login`
3. `npx wrangler secret put OPENAI_API_KEY`
4. Optional: `npx wrangler secret put OPENAI_MODEL` and enter `gpt-5.6-terra`.
5. `npm run deploy`

Never place the OpenAI key in `public/config.js`.

## Cloudflare dashboard static-asset upload

Use the separate assets-only ZIP. Do not upload `wrangler.jsonc` in the
individual asset uploader. The complete browser application is inside `public`.
