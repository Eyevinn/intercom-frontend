export type CallRef = {
  productionId: string;
  lineId: string;
};

export function encodeCallsParam(calls: CallRef[]): string {
  return calls.map((c) => `${c.productionId}:${c.lineId}`).join(",");
}

export function decodeCallsParam(param: string | null): CallRef[] {
  if (!param) return [];
  return param.split(",").reduce<CallRef[]>((acc, s) => {
    const parts = s.split(":");
    if (parts.length < 2 || !parts[0] || !parts[1]) return acc;
    acc.push({ productionId: parts[0], lineId: parts[1] });
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
