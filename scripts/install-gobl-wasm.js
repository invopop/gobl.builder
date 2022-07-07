#!/usr/bin/env node

import fetch from "node-fetch";
import fs from "fs";
import zlib from "zlib";
import dotenv from "dotenv";

dotenv.config();
const goblVersion = process.env.VITE_GOBL_VERSION;
const path = `public/gobl.v${goblVersion}.wasm`;

if (fs.existsSync(path)) {
  console.log(`Skipping GOBL WASM download: path "${path}" already exists.`);
  process.exit(0);
}

const ws = fs.createWriteStream(path);
const gunzip = zlib.createGunzip();

const url = `https://github.com/invopop/gobl.cli/releases/download/v${goblVersion}/gobl.${goblVersion}.wasm.gz`;
const res = await fetch(url);

await new Promise((resolve, reject) => {
  res.body.on("error", reject);
  gunzip.on("error", reject);
  ws.on("finish", resolve);

  res.body.pipe(gunzip).pipe(ws);
});

console.log(`Finished downloading GOBL WASM to "${path}".`);
