export type CallRef = {
  productionId: string;
  lineId: string;
  role?: "l" | "p";
};

export function encodeCallsParam(calls: CallRef[]): string {
  return calls
    .map((c) =>
      c.role
        ? `${c.productionId}:${c.lineId}:${c.role}`
        : `${c.productionId}:${c.lineId}`
    )
    .join(",");
}

export function decodeCallsParam(param: string | null): CallRef[] {
  if (!param) return [];
  return param.split(",").reduce<CallRef[]>((acc, s) => {
    const parts = s.split(":");
    if (parts.length < 2 || !parts[0] || !parts[1]) return acc;
    const role = parts[2] === "l" || parts[2] === "p" ? parts[2] : undefined;
    const ref: CallRef = {
      productionId: parts[0],
      lineId: parts[1],
      ...(role ? { role } : {}),
    };
    acc.push(ref);
    return acc;
  }, []);
}

/** Host[:port] only — reject schemes, paths, userinfo, and other SSRF-friendly shapes. */
const COMPANION_HOST_RE =
  /^(?:(?:\[[0-9a-fA-F:.]+\]|[A-Za-z0-9.-]+))(?::\d{1,5})?$/;

export function isValidCompanionHost(hostPort: string): boolean {
  if (!hostPort || hostPort.length > 253) return false;
  if (!COMPANION_HOST_RE.test(hostPort)) return false;
  // Reject port 0 and oversized ports.
  const colon = hostPort.lastIndexOf(":");
  if (colon > 0 && !hostPort.endsWith("]")) {
    const port = Number(hostPort.slice(colon + 1));
    if (!Number.isInteger(port) || port < 1 || port > 65535) return false;
  }
  return true;
}

export function buildCallsUrl(calls: CallRef[], companionUrl?: string): string {
  const base =
    calls.length === 0 ? "/calls" : `/calls?lines=${encodeCallsParam(calls)}`;
  let url = base;
  if (companionUrl) {
    const hostPort = companionUrl.replace(/^wss?:\/\//i, "");
    if (isValidCompanionHost(hostPort)) {
      const sep = url.includes("?") ? "&" : "?";
      url = `${url}${sep}companion=${hostPort}`;
    }
  }
  return url;
}

/**
 * True for loopback hosts (`localhost`, `*.localhost`, `127.0.0.0/8`, `[::1]`).
 * Browsers treat these as potentially trustworthy, so a `ws://` connection to
 * them is allowed from an https page and the traffic never leaves the machine.
 */
export function isLoopbackCompanionHost(hostPort: string): boolean {
  const host = hostPort.startsWith("[")
    ? hostPort.slice(0, hostPort.indexOf("]") + 1)
    : hostPort.replace(/:\d*$/, "");
  const lower = host.toLowerCase();
  return (
    lower === "localhost" ||
    lower.endsWith(".localhost") ||
    /^127(?:\.\d{1,3}){3}$/.test(lower) ||
    lower === "[::1]"
  );
}

/**
 * Choose the WebSocket scheme from the PAGE protocol and the validated host,
 * never from an attacker-supplied prefix. On an https page we must use
 * `wss://` — an `ws://` connection would be blocked as mixed content and,
 * where allowed, would carry companion control traffic in the clear. The
 * exception is a loopback host: Companion running on the same machine
 * typically serves plain `ws://`, browsers permit it, and nothing crosses the
 * network. On http we keep `ws://`.
 */
export function companionWsScheme(hostPort?: string): "ws" | "wss" {
  const isHttps =
    typeof window !== "undefined" && window.location?.protocol === "https:";
  if (!isHttps) return "ws";
  return hostPort && isLoopbackCompanionHost(hostPort) ? "ws" : "wss";
}

/**
 * Validate a bare host[:port] (reusing the #671 SSRF hardening) and wrap it in
 * a protocol-aware `ws://` / `wss://` URL. Any incoming scheme is stripped
 * BEFORE validation and BEFORE the scheme is chosen, so an attacker-supplied
 * `wss://` prefix can never influence the security decision (no scheme
 * confusion). Returns undefined for hosts that fail validation.
 */
export function buildCompanionWsUrl(param: string | null): string | undefined {
  if (!param) return undefined;
  // Strip accidental scheme if present, then validate host[:port] only.
  const hostPort = param.replace(/^wss?:\/\//i, "");
  if (!isValidCompanionHost(hostPort)) return undefined;
  return `${companionWsScheme(hostPort)}://${hostPort}`;
}

export function parseCompanionParam(param: string | null): string | undefined {
  return buildCompanionWsUrl(param);
}
