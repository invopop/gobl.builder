import { derived, writable } from "svelte/store";
import * as GOBL from "@invopop/gobl-worker";
import type { GOBLError, Notification } from "@invopop/gobl-worker";
import type * as monaco from "monaco-editor";

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

export const editorProblems = writable<monaco.editor.IMarker[]>([]);

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

export const envelopeAndEditorJSON = derived([envelope, editor], ([$envelope, $editor]) => {
  let envelopeValue: string | null = null;

  if ($envelope) {
    try {
      envelopeValue = JSON.stringify(
        {
          ...$envelope,
          doc: JSON.parse($editor || ""),
        },
        null,
        4,
      );
    } catch (e) {
      // If the editor doesn't contain valid JSON, envelope is `null`.
      envelopeValue = null;
    }
  }

  return [envelopeValue, $editor];
});

function createNotificationStore() {
  const { subscribe, set } = writable<Notification | null>(null);
  return {
    subscribe,
    set,
  };
}
export const notifications = createNotificationStore();

function createGOBLErrorStore() {
  const { subscribe, set } = writable<GOBLError | null>(null);

  return {
    subscribe,
    set,
  };
}

export const goblError = createGOBLErrorStore();
