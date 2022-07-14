import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    // TODO: Remove proxy once CORS header has been added at pdf.invopop.com/api.
    proxy: {
      "/pdf": {
        target: "https://pdf.invopop.com",
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pdf/, ""),
      },
    },
  },
});
