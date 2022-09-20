/**
 * Source: https://github.com/microsoft/monaco-editor/blob/35eb0efbc039827432002ccc17b120eb0874d70f/src/language/json/jsonWorker.ts
 */

import type * as monaco from "monaco-editor";
import * as worker from "monaco-editor/esm/vs/editor/editor.worker.js";
import { JSONWorker, type ICreateData } from "$lib/monaco-editor/jsonWorker.js";

self.onmessage = () => {
  // ignore the first message
  worker.initialize((ctx: monaco.worker.IWorkerContext<undefined>, createData: ICreateData) => {
    return new JSONWorker(ctx, createData);
  });
};
