# Examiner-Evaluation-Platform

## Local development

- Backend (Express): reads `.env` from the repo root.
  - Required: `MONGO_URI`
  - Optional: `PORT` (defaults to `3000` if unset)
  - Optional: `CORS_ORIGINS` (comma-separated list of allowed origins)
- Frontend (CRA): proxies API requests to the backend in development.

### Environment switching (local vs production)

- Backend (recommended):
  - Local: put `MONGO_URI` in the repo root `.env`
  - Cloud Run: set `MONGO_URI` as a Cloud Run environment variable (do not rely on `.env`)
  - Optional alternative: set `ENVIRONMENT=local|production` and use `MONGO_URI_LOCAL`/`MONGO_URI_PROD`
- Frontend:
  - Local dev: set `REACT_APP_ENV=local` to force proxy mode (no CORS) even if `REACT_APP_API_BASE_URL` is set
  - GitHub Pages: configure runtime `API_BASE_URL` in `frontend/public/app-config.js`

### Run backend

- `pnpm --filter backend dev`

### Run frontend

- `pnpm --filter frontend start`

The frontend calls the backend using relative paths by default, and `frontend/package.json` sets `"proxy": "http://localhost:5000"`.

## GitHub Pages deployment

GitHub Pages is static, so the frontend must be configured with your backend URL.

- Edit `frontend/public/app-config.js` and set `API_BASE_URL` to your backend origin (example: `"https://your-api.example.com"`).
- Ensure your backend allows the GitHub Pages origin via `CORS_ORIGINS` (example: `https://mdzhodges.github.io`).
