import { writable } from "svelte/store";
import * as GOBL from "../lib/gobl";
import type { Severity } from "../ui/alerts";

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

type Status = {
  severity: Severity;
  message: string;
  context?: string;
};

export const keypair = createKeypairStore();
export const editor = writable("");
export const draft = writable(false);
export const status = writable<Status>(null);
