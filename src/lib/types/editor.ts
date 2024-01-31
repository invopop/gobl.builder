import type * as monaco from "monaco-editor";
import type { GOBLError, Keypair } from "@invopop/gobl-worker";
import type { Readable, Writable } from "svelte/store";
import type { UIModelRootField } from "$lib/editor/form/utils/model";

export type State = "init" | "empty" | "loaded" | "modified" | "invalid" | "errored" | "built" | "signed" | "corrected";

export type DocumentHeader = {
  label: string;
  slug: string;
};

export type BuilderContext = {
  keypair: Writable<Keypair | null>;
  goblError: Writable<GOBLError | null>;
  editorProblems: Writable<monaco.editor.IMarker[]>;
  jsonSchema: Writable<string | null>;
  editor: Writable<{
    updatedAt: number;
    value: string;
  }>;
  editorJSON: Readable<{
    updatedAt: number;
    value: Record<string, unknown> | Error;
  }>;
  validEditor: Readable<boolean>;
  currentEditorSchema: Readable<string>;
  someEditorValueIsEmpty: Readable<boolean>;
  recreatingUiModel: Writable<boolean>;
  uiModel: Writable<{
    value: UIModelRootField | undefined;
    updatedAt: number;
  }>;
  updateSchema(value: string): void;
};
