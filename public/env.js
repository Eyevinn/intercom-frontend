// Runtime configuration placeholder.
//
// In a container deployment, scripts/entrypoint.sh regenerates this file at
// startup from the MANAGER_URL / OSC_HOSTNAME / AUTH environment variables so
// each deployment can point the pre-built static bundle at its own backend
// without rebuilding. During local `vite dev` / `vite build` it stays empty,
// leaving the app to fall back to build-time env vars and
// window.location.origin (see src/utils/runtime-config.ts).
window.__ENV__ = window.__ENV__ || {};
