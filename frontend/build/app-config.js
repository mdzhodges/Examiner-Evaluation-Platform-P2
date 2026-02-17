// Runtime configuration for deployments (e.g. GitHub Pages).
// Set `API_BASE_URL` to your backend origin, e.g. "https://your-api.example.com".
// Leave empty to use relative API paths (useful with CRA dev proxy).
(() => {
  const hostname = window.location.hostname;
  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0";

  window.__APP_CONFIG__ = {
    // Use CRA dev proxy locally (no CORS), use Cloud Run in GitHub Pages.
    API_BASE_URL: isLocal ? "" : "https://examiner-backend-622096286608.us-east1.run.app"
  };
})();
