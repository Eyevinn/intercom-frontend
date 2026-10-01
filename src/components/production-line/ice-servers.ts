/**
 * Resolves the ICE servers used for the WebRTC peer connection.
 *
 * ICE servers are configurable via the `VITE_ICE_SERVERS` environment variable,
 * which must be a JSON array string (e.g. the value of `RTCIceServer[]`). When
 * the variable is unset, or set to a value that cannot be parsed as JSON, the
 * hardcoded Google STUN defaults are used instead. A parse error is logged as a
 * warning and must never throw, so that call setup is not broken by a
 * misconfigured environment.
 */

export const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export const resolveIceServers = (
  rawIceServers: string | undefined = import.meta.env.VITE_ICE_SERVERS
): RTCIceServer[] => {
  if (!rawIceServers) {
    return DEFAULT_ICE_SERVERS;
  }

  try {
    return JSON.parse(rawIceServers) as RTCIceServer[];
  } catch (error) {
    console.warn(
      "Failed to parse VITE_ICE_SERVERS as JSON, falling back to default ICE servers.",
      error
    );
    return DEFAULT_ICE_SERVERS;
  }
};
