import { derived, writable, get } from "svelte/store";
import * as GOBL from "@invopop/gobl-worker";
import type { GOBLError } from "@invopop/gobl-worker";
import type * as monaco from "monaco-editor";
import type { Notification } from "$lib/notifications/index.js";
import { encodeUTF8ToBase64 } from "$lib/encodeUTF8ToBase64.js";
import { Severity, createNotification } from "$lib/notifications/index.js";

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
export const editor = writable<string | null>(null);

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

export async function handleBuild() {
  if (!get(validEditor)) {
    return;
  }

  try {
    const sendData = getGOBLPayload();

    const payload: GOBL.BuildPayload = {
      data: encodeUTF8ToBase64(sendData),
      draft: true,
      envelop: true,
    };
    const rawResult = await GOBL.build({ payload });
    const result = JSON.parse(rawResult);

    envelope.set(result);
    goblError.set(null);

    createNotification({
      severity: Severity.Success,
      message: "Document successfully built.",
    });

    return { result };
  } catch (e) {
    const goblErr = GOBL.parseGOBLError(e);
    goblError.set(goblErr);

    return {
      error: goblErr,
    };
  }
}

export async function handleSign() {
  const keypairValue = get(keypair);

  if (!get(validEditor) || !keypairValue) {
    return;
  }

  try {
    const sendData = getGOBLPayload();

    const payload: GOBL.SignPayload = {
      data: encodeUTF8ToBase64(sendData),
      privatekey: keypairValue.private,
    };
    const rawResult = await GOBL.sign({ payload });
    const result = JSON.parse(rawResult);

    envelope.set(result);
    goblError.set(null);

    createNotification({
      severity: Severity.Success,
      message: "Document successfully signed.",
    });

    return { result };
  } catch (e) {
    const goblErr = GOBL.parseGOBLError(e);
    goblError.set(goblErr);

    return {
      error: goblErr,
    };
  }
}

export async function handleValidate() {
  if (!get(validEditor) || !get(envelopeIsSigned)) {
    return;
  }

  try {
    const sendData = getGOBLPayload();

    const payload: GOBL.ValidatePayload = {
      data: encodeUTF8ToBase64(sendData),
    };
    await GOBL.validate({ payload });

    goblError.set(null);

    createNotification({
      severity: Severity.Success,
      message: "Document successfully validated.",
    });

    return { isValid: true };
  } catch (e) {
    const goblErr = GOBL.parseGOBLError(e);
    goblError.set(goblErr);

    return {
      isValid: false,
      error: goblErr,
    };
  }
}

function getGOBLPayload() {
  const editorValue = get(editor);
  const envelopeValue = get(envelope);
  const doc = JSON.parse(editorValue || "");
  if (doc.$schema == envelopeGOBLSchema) {
    return editorValue || ""; // send as-is
  }
  envelopeValue.doc = doc;

  return JSON.stringify(envelopeValue);
}
