import { derived, writable } from "svelte/store";
import type { Envelope } from "$lib/types/envelope";
import { newEnvelope } from "$lib/helpers/envelope";

export const undoAvailable = writable(false);
export const redoAvailable = writable(false);
export const envelope = writable<Envelope>(newEnvelope(null));
export const envelopeIsDraft = derived(envelope, ($envelope) => Boolean($envelope?.head?.draft === true));
export const envelopeIsSigned = derived(envelope, ($envelope) => Boolean($envelope?.sigs));

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

export const editorCursor = writable({ line: 1, column: 1 });
