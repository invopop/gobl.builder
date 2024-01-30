import type { Keypair } from "@invopop/gobl-worker";
import type { Writable } from "svelte/store";

export type State = "init" | "empty" | "loaded" | "modified" | "invalid" | "errored" | "built" | "signed" | "corrected";

export type DocumentHeader = {
  label: string;
  slug: string;
};

export type BuilderContext = {
  keypair: Writable<Keypair | null>;
};
