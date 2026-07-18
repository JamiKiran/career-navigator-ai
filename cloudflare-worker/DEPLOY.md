# Deploy Career Navigator AI

## Complete Worker deployment

Extract the project ZIP, open a terminal in the `cloudflare-worker` folder,
then run:

1. `npm install`
2. `npx wrangler login`
3. `npm run deploy`

## Cloudflare dashboard static-asset upload

Use the separate assets-only ZIP. Do not upload `wrangler.jsonc` in the
individual asset uploader. The complete browser application is inside `public`.
