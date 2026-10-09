/**
 * Resolves the ICE servers used for the WebRTC peer connection.
 *
 * ICE servers are configurable via the `VITE_ICE_SERVERS` environment variable,
 * which must be a JSON array string (e.g. the value of `RTCIceServer[]`). When
 * the variable is unset, or set to a value that cannot be parsed as JSON, or
 * parsed to something that is not a usable `RTCIceServer[]`, the hardcoded
 * Google STUN defaults are used instead. Any such problem is logged as a
 * warning and must never throw, so that call setup is not broken by a
 * misconfigured environment.
 */

export const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

// Schemes the browser accepts in an RTCIceServer `urls` entry. Anything else
// makes `new RTCPeerConnection({ iceServers })` throw at construction.
const ICE_URL_SCHEME = /^(stun|stuns|turn|turns):/;

const isValidIceUrl = (url: unknown): url is string =>
  typeof url === "string" && ICE_URL_SCHEME.test(url);

// A usable RTCIceServer has `urls` set to a well-formed STUN/TURN URL string,
// or a non-empty array of such strings. Validating this up front keeps the
// "never breaks call setup" guarantee: a valid-JSON-but-wrong-shape value
// (`5`, `null`, `{"urls":"…"}`, `[{"foo":"bar"}]`, `[{"urls":"no-scheme"}]`,
// `[{"urls":123}]`) is rejected here instead of throwing at construction.
const isValidIceServer = (entry: unknown): entry is RTCIceServer => {
  if (typeof entry !== "object" || entry === null || !("urls" in entry)) {
    return false;
  }
  const { urls } = entry as RTCIceServer;
  if (Array.isArray(urls)) {
    return urls.length > 0 && urls.every(isValidIceUrl);
  }
  return isValidIceUrl(urls);
};

export const resolveIceServers = (
  rawIceServers: string | undefined = import.meta.env.VITE_ICE_SERVERS
): RTCIceServer[] => {
  if (!rawIceServers) {
    return DEFAULT_ICE_SERVERS;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawIceServers);
  } catch (error) {
    console.warn(
      "Failed to parse VITE_ICE_SERVERS as JSON, falling back to default ICE servers.",
      error
    );
    return DEFAULT_ICE_SERVERS;
  }

  if (!Array.isArray(parsed)) {
    console.warn(
      "VITE_ICE_SERVERS is not a JSON array, falling back to default ICE servers."
    );
    return DEFAULT_ICE_SERVERS;
  }

  const iceServers = parsed.filter(isValidIceServer);
  if (iceServers.length === 0) {
    console.warn(
      "VITE_ICE_SERVERS contained no valid RTCIceServer entries (each needs a stun:/stuns:/turn:/turns: `urls` value), falling back to default ICE servers."
    );
    return DEFAULT_ICE_SERVERS;
  }

  return iceServers;
};
