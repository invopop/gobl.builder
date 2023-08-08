import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import packageJson from "./package.json";

export default defineConfig({
  plugins: [sveltekit()],
  define: {
    GOBL_CLI_VERSION: JSON.stringify(packageJson.gobl_cli_version),
  },
});
