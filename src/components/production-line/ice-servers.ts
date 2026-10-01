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

const hasUrls = (entry: unknown): entry is RTCIceServer =>
  typeof entry === "object" &&
  entry !== null &&
  "urls" in entry &&
  Boolean((entry as RTCIceServer).urls);

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

  // A valid-JSON value that is not an RTCIceServer[] (e.g. `5`, `null`,
  // `{"urls":"…"}`, `[{"foo":"bar"}]`) would otherwise reach
  // `new RTCPeerConnection({ iceServers })` and throw at construction, so
  // validate the shape here and keep the "never breaks call setup" guarantee.
  if (!Array.isArray(parsed)) {
    console.warn(
      "VITE_ICE_SERVERS is not a JSON array, falling back to default ICE servers.",
      parsed
    );
    return DEFAULT_ICE_SERVERS;
  }

  const iceServers = parsed.filter(hasUrls);
  if (iceServers.length === 0) {
    console.warn(
      "VITE_ICE_SERVERS contained no valid RTCIceServer entries, falling back to default ICE servers.",
      parsed
    );
    return DEFAULT_ICE_SERVERS;
  }

  return iceServers;
};
