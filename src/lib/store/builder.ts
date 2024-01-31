import type { BuilderContext } from "$lib/types/editor";
import type { GOBLError } from "@invopop/gobl-worker";
import { getContext, setContext } from "svelte";
import { writable } from "svelte/store";

const BUILDER_CONTEXT_ID = "builder-context";

export function createBuilderContext(): BuilderContext {
  const keypair = writable(null);
  const goblError = writable<GOBLError | null>(null);

  return setContext<BuilderContext>(BUILDER_CONTEXT_ID, { keypair, goblError });
}

export function getBuilderContext(): BuilderContext {
  return getContext<BuilderContext>(BUILDER_CONTEXT_ID);
}
