import base from "./playwright.config";
const URL = "http://localhost:5199";
export default {
  ...base,
  use: { ...base.use, baseURL: URL },
  webServer: {
    command: "npm run dev -- --port 5199 --strictPort",
    url: URL,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      VITE_BACKEND_URL: "http://localhost:8000/",
      VITE_BACKEND_API_VERSION: "api/v1/",
    },
  },
};
