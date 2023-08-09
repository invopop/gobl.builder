import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import packageJson from "./package.json";
//import { resolve } from "path";

export default defineConfig({
  plugins: [sveltekit()],
  define: {
    GOBL_CLI_VERSION: JSON.stringify(packageJson.gobl_cli_version),
  },
  /*
  build: {
    // Here we try to compile the gobl stuff into a single source
    lib: {
      entry: resolve(__dirname, "lib/gobl/index.ts"),
      name: "GOBL",
      fileName: "gobl",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["svelte"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          svelte: "Svelte",
        },
        inlineDynamicImports: false,
      },
    },
  },
  */
});
