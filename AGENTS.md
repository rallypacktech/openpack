# Base44 Dev Environment — RallyPack

## Stack
- Vite + React 18 (frontend only), using `@base44/sdk` + `@base44/vite-plugin`.
- The Base44 backend (entities, functions, agents) runs on the Base44 cloud platform — there is no local backend service. The Vite plugin proxies `/api` requests to the Base44 backend via `VITE_BASE44_APP_BASE_URL`.

## Running locally
```
docker compose -f docker-compose.base44.yml up -d
```
- Web entry point: host port 3000 → container Vite dev server on 5173.
- `npm install` runs at container startup; `node_modules` lives in a named volume.
- Vite dev server binds 0.0.0.0 with `allowedHosts: true` (set in `vite.config.js`) so the preview's external hostname is accepted.

## Required credentials (external — Base44 cloud backend)
- `VITE_BASE44_APP_ID` — the app ID for the Base44 SDK client (`src/lib/app-params.js`).
- `VITE_BASE44_APP_BASE_URL` — backend URL the Vite plugin proxies `/api` to.
- Without these the app still renders its public landing page, but any data/auth/function calls fail. Both are delivered via `/run/base44/app.env` (platform-managed, outside the repo).

## Verifying it works
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` returns the RallyPack landing page (HTTP 200).
- The dev server logs live Vite compilation; served modules are unhashed source (not a production bundle).
