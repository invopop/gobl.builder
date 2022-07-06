export type {}; // Needed when compiling with `--isolatedModules`.

import "./wasm_exec.js";

const goblVersion = import.meta.env.VITE_GOBL_VERSION;

// Polyfill instantiateStreaming for browsers missing it.
if (!WebAssembly.instantiateStreaming) {
  WebAssembly.instantiateStreaming = async (resp, importObject) => {
    const source = await (await resp).arrayBuffer();
    return await WebAssembly.instantiate(source, importObject);
  };
}

// Initialize the Go WASM glue.
const go = new Go();
WebAssembly.instantiateStreaming(fetch(`/gobl.v${goblVersion}.wasm`), go.importObject).then((result) => {
  go.run(result.instance);
});
