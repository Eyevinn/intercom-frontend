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
    const ref: CallRef = { productionId: parts[0], lineId: parts[1] };
    if (parts[2] === "l" || parts[2] === "p") {
      ref.role = parts[2];
    }
    acc.push(ref);
    return acc;
  }, []);
}

export function buildCallsUrl(calls: CallRef[], companionUrl?: string): string {
  const base =
    calls.length === 0 ? "/lines" : `/lines?lines=${encodeCallsParam(calls)}`;
  let url = base;
  if (companionUrl) {
    const hostPort = companionUrl.replace(/^wss?:\/\//, "");
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}companion=${hostPort}`;
  }
  return url;
}

export function parseCompanionParam(param: string | null): string | undefined {
  if (!param) return undefined;
  return `ws://${param}`;
}
