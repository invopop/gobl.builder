import { derived, writable, type Readable, type Writable } from "svelte/store";
import type * as monaco from "monaco-editor";
import * as GOBL from "$lib/gobl.js";
import type { EditorCursorPosition, EditorViewType } from "./types.js";

function createKeypairStore() {
  const { subscribe, set } = writable<GOBL.Keypair | null>(null);

  return {
    subscribe,
    create: async () => {
      const keypair = await GOBL.keygen();
      set(keypair);
      return keypair;
    },
  };
}

export const keypair = createKeypairStore();

export const editor: Writable<{
  updatedAt: number;
  value: string;
}> = writable({ updatedAt: 0, value: "" });

export const editorJSON: Readable<{
  updatedAt: number;
  value: Record<string, unknown> | Error;
}> = derived(editor, ($editor) => {
  if (!$editor.value) return $editor;

  let value;

  try {
    value = JSON.parse($editor.value);
  } catch (e) {
    value = e as Error;
  }

  return {
    ...$editor,
    value,
  };
});

export const undoAvailable = writable(false);
export const redoAvailable = writable(false);

export interface Envelope {
  doc: {
    $schema: string;
    supplier?: {
      tax_id?: {
        country: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  head: {
    uuid: string;
    dig: {
      alg: string;
      val: string;
    };
    stamps?: Array<{
      prv: string;
      val: string;
    }>;
    tags?: string[];
    meta?: Record<string, unknown>;
    notes?: string;
    draft?: boolean;
  };
  sigs?: string[];
}

export const envelope = writable<Envelope | null>(null);
export const envelopeIsDraft = derived(envelope, ($envelope) => Boolean($envelope?.head.draft === true));
export const envelopeIsSigned = derived(envelope, ($envelope) => Boolean($envelope?.sigs));

export const envelopeAndEditorJSON = derived([envelope, editor], ([$envelope, $editor]) => {
  let envelopeValue: string | null = null;

  if ($envelope) {
    try {
      envelopeValue = JSON.stringify(
        {
          ...$envelope,
          doc: JSON.parse($editor.value),
        },
        null,
        4
      );
    } catch (e) {
      // If the editor doesn't contain valid JSON, envelope is `null`.
      envelopeValue = null;
    }
  }

  return [envelopeValue, $editor];
});

export type GOBLError = {
  message: string;
  code: number;
};

function createGOBLErrorStore() {
  const { subscribe, set } = writable<GOBLError | null>(null);

  return {
    subscribe,
    set,
  };
}

export const editorProblems = writable<monaco.editor.IMarker[]>([]);

export const goblError = createGOBLErrorStore();

export const editorViewType = writable<EditorViewType>("form");

export const editorCursor = writable<EditorCursorPosition>({ line: 1, column: 1 });
