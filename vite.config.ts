/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  // Expose ONLY the exact `AUTH` build-time env var to the client bundle. Using
  // `envPrefix: ["AUTH"]` would be a prefix match and leak every `AUTH*` var, so
  // instead define just `import.meta.env.AUTH` explicitly. The default `VITE_`
  // prefix behavior is left untouched by not overriding `envPrefix`.
  define: {
    "import.meta.env.AUTH": JSON.stringify(process.env.AUTH ?? ""),
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./src/test-utils/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
