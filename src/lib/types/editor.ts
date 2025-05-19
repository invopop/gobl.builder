import type * as monaco from "monaco-editor";
import type { GOBLError, Keypair } from "@invopop/gobl-worker";
import type { Readable, Writable } from "svelte/store";
import type { UIModelRootField } from "$lib/editor/form/utils/model";
import type { Envelope } from "./envelope";

export type State = "init" | "empty" | "loaded" | "modified" | "invalid" | "errored" | "built" | "signed" | "corrected";

export type BuildOptions = {
  removeStamps?: boolean;
};

export type DocumentHeader = {
  label: string;
  slug: string;
  active?: boolean;
};

export type BuilderContext = {
  envelope: Writable<Envelope>;
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
  envelopeIsSigned: Readable<boolean>;
  currentEditorSchema: Readable<string>;
  someEditorValueIsEmpty: Readable<boolean>;
  recreatingUiModel: Writable<boolean>;
  undoAvailable: Writable<boolean>;
  redoAvailable: Writable<boolean>;
  uiModel: Writable<{
    value: UIModelRootField | undefined;
    updatedAt: number;
  }>;
  activeSection: Writable<{ section: null | string; scroll: boolean }>;
  activeItem: Writable<null | string>;
  highlightedItem: Writable<null | string>;
  scrollingSection: Writable<boolean>;
  documentHeaders: Readable<DocumentHeader[]>;
  updateSchema(value: string): void;
  recreateEditor(): void;
};
