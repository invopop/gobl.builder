import { derived, writable, type Writable, type Readable } from "svelte/store";
import * as GOBL from "@invopop/gobl-worker";
import type { GOBLError } from "@invopop/gobl-worker";
import type * as monaco from "monaco-editor";
import type { Notification } from "$lib/notifications/index.js";

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

export const envelopeGOBLSchema = "https://gobl.org/draft-0/envelope";

export const editorProblems = writable<monaco.editor.IMarker[]>([]);

// editor represents the JSON content in the editor
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

export const jsonSchema = writable<string | null>(null);
export const keypair = createKeypairStore();
export const undoAvailable = writable(false);
export const redoAvailable = writable(false);
export const validEditor = derived([jsonSchema, editor], ([$jsonSchema, $editor]) => {
  try {
    const parsed = JSON.parse($editor || "");
    if ($jsonSchema && parsed.$schema !== $jsonSchema) {
      return false;
    }
  } catch (e) {
    return false;
  }

  return true;
});

export interface Envelope {
  $schema: string;
  doc?: Document | null;
  head?: {
    uuid?: string;
    dig?: {
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

// Document contains the data to show in the editor
export interface Document {
  $schema?: string;
  supplier?: {
    tax_id?: {
      country: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const envelope = writable<Envelope>(buildNewEnvelope(null));
export const envelopeIsDraft = derived(envelope, ($envelope) => Boolean($envelope?.head?.draft === true));
export const envelopeIsSigned = derived(envelope, ($envelope) => Boolean($envelope?.sigs));

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

function buildNewEnvelope(doc: Document | null): Envelope {
  return {
    $schema: envelopeGOBLSchema,
    doc: doc,
    head: {
      draft: true,
    },
  };
}

export const newEnvelope = buildNewEnvelope;

export function envelopeDocumentJSON(envelope: Envelope | null): string {
  if (!envelope?.doc) {
    return "";
  }
  return JSON.stringify(envelope.doc, null, 4);
}

export function envelopeDocumentSchema(envelope: Envelope | null): string {
  if (!envelope?.doc?.$schema) {
    return "";
  }
  return envelope.doc.$schema;
}
