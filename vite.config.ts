import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
// import { resolve } from 'path';
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  // build: {
  //   rollupOptions: {
  //     input: {
  //       main: resolve(__dirname, 'index.html'),
  //       callFrame: resolve(__dirname, 'call-frame.html')
  //     }
  //   }
  // }
});
