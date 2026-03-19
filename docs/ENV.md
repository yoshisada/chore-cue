# Environment variables

## Where to add them

| File | When it's used |
|------|-----------------|
| **`.env`** | Base env; loaded first. Optional (can be empty). |
| **`.env.development`** | Local dev. Used by `bun env:dev` and `bun dev` (via dotenvx `-f .env .env.development`). |
| **`.env.production`** | Production. Used by `bun run:prod` and CI. Copy from `.env.production.example`. |

All of these are gitignored. Use the `.example` files as templates.

---

## Quick start (local dev only)

1. Copy the example:
   ```bash
   cp .env.development.example .env.development
   ```
2. Edit `.env.development` and set at least:
   - **`BETTER_AUTH_SECRET`** – at least 32 characters. Generate with:
     ```bash
     npx @better-auth/cli secret
     # or
     openssl rand -base64 32
     ```
   - **`BETTER_AUTH_URL`** – usually `http://localhost:8081` (or your Metro URL).
   - **`ONE_SERVER_URL`** – same as `BETTER_AUTH_URL` in dev.

3. Optional: create a minimal **`.env`** if you want (can be empty).

---

## Variable reference

### Required for app + auth (dev and prod)

| Variable | Description |
|----------|-------------|
| `ONE_SERVER_URL` | App server URL (e.g. `http://localhost:8081` in dev). |
| `BETTER_AUTH_URL` | Same as app URL for auth callbacks. |
| `BETTER_AUTH_SECRET` | Secret for signing sessions; min 32 chars. |

### Optional / context-dependent

| Variable | Description |
|----------|-------------|
| `VITE_PUBLIC_ZERO_SERVER` | Zero sync server URL. If unset in dev, the app uses the same host as the dev server with port 4948 (so Expo Go on a device can reach your Mac’s Zero server). |
| `ZERO_UPSTREAM_DB` | Postgres URL for main app DB. **Required** if you run Zero server or migrations. |
| `ZERO_CVR_DB` | Postgres URL for Zero CVR DB. Needed for migrations. |
| `ZERO_CHANGE_DB` | Postgres URL for Zero change DB. Needed for migrations. |
| `FORCE_ISSUER` | Override auth token issuer (server-only). |
| `DEBUG` | Set to log auth API debug output. |
| `VITE_DEMO_MODE` | Set to `1` to enable demo mode. |

### Production-only (see `.env.production.example`)

Production uses the same required auth vars plus Zero DB URLs and any deployment-specific vars. Copy `.env.production.example` to `.env.production` and fill in real values.

---

## Zero sync (WebSocket) and “Connection refused”

The app connects to the **Zero** sync server over WebSocket. If you see “WebSocket connection closed abruptly” or “Connection refused”:

1. **Start the backend** so the Zero server is running:
   ```bash
   bun run backend
   ```
   This starts Docker (Postgres + Zero) and exposes Zero on port **4948**.

2. **On a physical device**: The app now derives the Zero URL from the same host as Metro (e.g. `http://10.0.0.150:4948`). You don’t need to set `VITE_PUBLIC_ZERO_SERVER` unless you want to override it.

3. **Without the backend**: Zero features (sync, real-time) won’t work; auth and the rest of the app can still work.

---

## How loading works

- **Dev:** `bun env:dev` and `bun dev` use **dotenvx** with `-f .env .env.development`, so `.env.development` overrides `.env`.
- **Prod:** Scripts use `-f .env .env.production`.
- **Tests:** Integration tests use `getTestEnv()` (see `scripts/helpers/get-test-env.ts`), which loads development env and overlays test values.
