import type * as monaco from "monaco-editor";
import type { GOBLError, Keypair } from "@invopop/gobl-worker";
import type { Writable } from "svelte/store";

export type State = "init" | "empty" | "loaded" | "modified" | "invalid" | "errored" | "built" | "signed" | "corrected";

export type DocumentHeader = {
  label: string;
  slug: string;
};

export type BuilderContext = {
  keypair: Writable<Keypair | null>;
  goblError: Writable<GOBLError | null>;
  editorProblems: Writable<monaco.editor.IMarker[]>;
};
