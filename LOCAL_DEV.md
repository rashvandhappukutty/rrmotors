# Running RR Motors Locally

## Quick start (frontend + backend together)

From the project root:

```bash
npm run start
```

This runs:
- **Frontend** (Vite) at http://localhost:8080  
- **Backend** (Express API) at http://localhost:5000  

The frontend uses `/api`, which the Vite dev server proxies to the backend.

---

## Run frontend and backend separately

**Terminal 1 – backend (API):**
```bash
npm run dev:server
```
API will be at http://localhost:5000

**Terminal 2 – frontend:**
```bash
npm run dev
```
App will be at http://localhost:8080. API calls to `/api/*` are proxied to port 5000.

---

## If you see `ERR_CONNECTION_REFUSED` to localhost:5000

- The **backend is not running**. Start it with one of the options above.
- Do **not** set `VITE_API_URL=http://localhost:5000` in `.env` for local dev. Use a relative URL so the Vite proxy is used (see `.env` – `VITE_API_URL` should be empty or `/api`).

---

## Environment

- `.env` – local development (Vite + server)
- `.env.production` – used for `vite build` (e.g. Vercel); uses relative `/api`
