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
  ICE_SERVERS?: string;
};

/**
 * Default STUN servers used when no ICE configuration is supplied. These are
 * Google's public STUN servers; they are only a fallback so out-of-the-box
 * behavior is unchanged. Operators concerned about leaking client IPs to a
 * third party (or needing TURN) should override via ICE_SERVERS /
 * VITE_ICE_SERVERS — see getIceServers.
 */
const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

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

/**
 * ICE servers for the WebRTC peer connections, resolved (first non-empty wins)
 * from the runtime window.__ENV__.ICE_SERVERS, then the build-time
 * VITE_ICE_SERVERS, then the Google STUN defaults. The configured value must be
 * a JSON array of RTCIceServer objects, e.g.
 *   [{"urls":"stun:stun.example.com:3478"},
 *    {"urls":"turn:turn.example.com:3478","username":"u","credential":"p"}]
 * A missing, empty, malformed or non-array value falls back to the defaults so
 * a misconfiguration can never leave the app without ICE servers.
 */
export const getIceServers = (): RTCIceServer[] => {
  const raw = firstNonEmpty(
    getRuntimeEnv().ICE_SERVERS,
    import.meta.env.VITE_ICE_SERVERS
  );
  if (!raw) return DEFAULT_ICE_SERVERS;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as RTCIceServer[];
    }
    console.warn(
      "Ignoring ICE_SERVERS config: expected a non-empty JSON array; using defaults."
    );
  } catch {
    console.warn(
      "Ignoring ICE_SERVERS config: value is not valid JSON; using defaults."
    );
  }
  return DEFAULT_ICE_SERVERS;
};
