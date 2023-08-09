export type {}; // Needed when compiling with `--isolatedModules`.

import "./wasm_exec.js";

const goblCliVersion = "0.64.0";

const wasmUrl = `https://cdn.gobl.org/cli/gobl.${goblCliVersion}.wasm`;

// Polyfill instantiateStreaming for browsers missing it.
if (!WebAssembly.instantiateStreaming) {
  WebAssembly.instantiateStreaming = async (resp, importObject) => {
    const source = await (await resp).arrayBuffer();
    return await WebAssembly.instantiate(source, importObject);
  };
}

// Initialize the Go WASM glue.
const go = new Go();
WebAssembly.instantiateStreaming(fetch(wasmUrl), go.importObject)
  .then((result) => {
    go.run(result.instance);
  })
  .catch((err) => {
    postMessage({
      severity: "error",
      message: "Failed to run GOBL WASM instance.",
      context: err,
    });
  });
