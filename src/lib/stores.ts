import { derived, writable } from "svelte/store";
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
export const editor = writable("");
export const undoAvailable = writable(false);
export const redoAvailable = writable(false);

export const validEditor = derived([keypair, editor], ([$keypair, $editor]) => {
  if (!$keypair) {
    return false;
  }
  try {
    JSON.parse($editor);
    return true;
  } catch (e) {
    return false;
  }
});

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

export const goblError = createGOBLErrorStore();
