import { derived, writable } from "svelte/store";
import type * as monaco from "monaco-editor";
import * as GOBL from "$lib/gobl.js";

function createKeypairStore() {
  const { subscribe, set } = writable<GOBL.Keypair | null>(null, function start(set) {
    GOBL.keygen().then((value) => {
      set(value);
      console.log("Created keypair.", value);
    });
  });

  return {
    subscribe,
    renew: async () => set(await GOBL.keygen()),
  };
}

export const keypair = createKeypairStore();
export const editor = writable<string | null>(null);
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

export const envelopeOrDocJSON = derived([envelope, editor], ([$envelope, $editor]) => {
  if ($envelope) {
    let editorParsed: unknown;

    try {
      editorParsed = JSON.parse($editor || "");
    } catch (e) {
      // If editor contains invalid JSON, we cannot return an envelope with that
      // invalid JSON, so we return `null`, which isn't bound to the parent
      // component.
      return null;
    }
    // If there's an envelope, we return the existing envelope with its `doc`
    // property replaced by the current editor contents.
    return JSON.stringify(
      {
        ...$envelope,
        doc: editorParsed,
      },
      null,
      4
    );
  }

  // If there's no envelope, we return the editor contents as-is (either valid
  // or invalid JSON).
  return $editor;
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
