/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  // Expose the literally-named `AUTH` build-time env var (no VITE_ prefix) to
  // `import.meta.env` in addition to the default `VITE_`-prefixed vars.
  envPrefix: ["VITE_", "AUTH"],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./src/test-utils/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
