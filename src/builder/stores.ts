import { writable } from "svelte/store";
import * as GOBL from "../lib/gobl";

function createKeypairStore() {
  const { subscribe, set } = writable<GOBL.Keypair>(null, function start(set) {
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
export const draft = writable(true);

interface Envelope {
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
}

export const envelope = writable<Envelope>(null);

export type GOBLError = {
  message: string;
  code: number;
};

function createGOBLErrorStore() {
  const { subscribe, set } = writable<GOBLError>(null);

  return {
    subscribe,
    set,
  };
}

export const goblError = createGOBLErrorStore();
