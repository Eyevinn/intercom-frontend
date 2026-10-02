import { getBackendUrl } from "./runtime-config.ts";

export const generateWhepUrl = (
  productionId: string,
  lineId: string,
  username: string
): string => {
  const API_VERSION = import.meta.env.VITE_BACKEND_API_VERSION ?? "api/v1/";
  const API_URL = `${getBackendUrl()}/${API_VERSION}`;

  return `${API_URL.replace(/\/+$/, "")}/whep/${productionId}/${lineId}/${encodeURIComponent(username)}`;
};
