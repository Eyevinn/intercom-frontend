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

export function parseCompanionParam(param: string | null): string | undefined {
  if (!param) return undefined;
  // Strip accidental scheme if present, then validate host[:port] only.
  const hostPort = param.replace(/^wss?:\/\//i, "");
  if (!isValidCompanionHost(hostPort)) return undefined;
  return `ws://${hostPort}`;
}
