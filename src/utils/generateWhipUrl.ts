export const generateWhipUrl = (
  productionId: string,
  lineId: string,
  username: string
): string => {
  const API_VERSION = import.meta.env.VITE_BACKEND_API_VERSION ?? "api/v1/";
  const API_URL =
    `${import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "")}/${API_VERSION}` ||
    `${window.location.origin}/${API_VERSION}`;

  return `${API_URL.replace(/\/+$/, "")}/whip/${productionId}/${lineId}/${encodeURIComponent(username)}`;
};
