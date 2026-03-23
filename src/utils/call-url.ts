export type CallRef = { productionId: string; lineId: string };

export function encodeCallsParam(calls: CallRef[]): string {
  return calls.map((c) => `${c.productionId}:${c.lineId}`).join(",");
}

export function decodeCallsParam(param: string | null): CallRef[] {
  if (!param) return [];
  return param
    .split(",")
    .map((s) => s.split(":"))
    .filter((parts) => parts.length === 2 && parts[0] && parts[1])
    .map(([productionId, lineId]) => ({ productionId, lineId }));
}

export function buildCallsUrl(calls: CallRef[]): string {
  if (calls.length === 0) return "/calls";
  return `/calls?calls=${encodeCallsParam(calls)}`;
}
