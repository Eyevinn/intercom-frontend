export const generateWhipUrl = (
  productionId: string,
  lineId: string,
  username: string
): string => {
  const baseUrl =
    import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") ||
    "http://localhost:8000";
  const apiVersion =
    import.meta.env.VITE_BACKEND_API_VERSION?.replace(/^\/+|\/+$/g, "") ||
    "api/v1";

  return `${baseUrl}/${apiVersion}/whip/${productionId}/${lineId}/${encodeURIComponent(username)}`;
};
