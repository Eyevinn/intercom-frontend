/* eslint-disable no-underscore-dangle -- `window.__ENV__` is the runtime-config
   global injected by scripts/entrypoint.sh; the double-underscore name is the
   intentional, widely recognized convention for this pattern. */
/**
 * Runtime configuration injected by the container entrypoint.
 *
 * The production (nginx) image serves a pre-built static bundle, so the
 * build-time Vite env vars (VITE_BACKEND_URL / AUTH) are baked into the bundle
 * and cannot vary per deployment. To restore per-container configuration,
 * scripts/entrypoint.sh regenerates /usr/share/nginx/html/env.js at container
 * start from the MANAGER_URL / OSC_HOSTNAME / AUTH environment variables. That
 * file assigns `window.__ENV__`, and index.html loads it before the app bundle.
 *
 * Resolution order (first non-empty value wins):
 *   1. window.__ENV__          (runtime, per-container)
 *   2. import.meta.env         (build time: VITE_BACKEND_URL / AUTH)
 *   3. window.location.origin  (same-origin default — unchanged OSC behavior)
 *
 * During local `vite dev` / `vite build` the placeholder public/env.js leaves
 * `window.__ENV__` empty, so the app falls back to build-time env vars exactly
 * as before.
 */

export type TRuntimeEnv = {
  MANAGER_URL?: string;
  AUTH?: string;
};

declare global {
  interface Window {
    __ENV__?: TRuntimeEnv;
  }
}

const getRuntimeEnv = (): TRuntimeEnv => {
  if (typeof window === "undefined") return {};
  return window.__ENV__ ?? {};
};

const firstNonEmpty = (...values: (string | undefined)[]): string | undefined =>
  values.find((value) => typeof value === "string" && value.length > 0);

/**
 * Backend/manager base URL, normalized without trailing slashes. Falls back to
 * the current origin when neither runtime nor build-time config is set, so the
 * same-origin OSC default is preserved.
 */
export const getBackendUrl = (): string => {
  const base = firstNonEmpty(
    getRuntimeEnv().MANAGER_URL,
    import.meta.env.VITE_BACKEND_URL,
    window.location.origin
  );
  return (base ?? window.location.origin).replace(/\/+$/, "");
};

/**
 * Optional OSC login URL; an empty string (or unset) means the auth redirect is
 * disabled, matching the previous build-time-only behavior.
 */
export const getAuthUrl = (): string =>
  firstNonEmpty(getRuntimeEnv().AUTH, import.meta.env.AUTH) ?? "";
