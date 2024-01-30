import type { BuilderContext } from "$lib/types/editor";
import { getContext, setContext } from "svelte";
import { writable } from "svelte/store";

const BUILDER_CONTEXT_ID = "builder-context";

export function createBuilderContext(): BuilderContext {
  const keypair = writable(null);

  return setContext<BuilderContext>(BUILDER_CONTEXT_ID, { keypair });
}

export function getBuilderContext(): BuilderContext {
  return getContext<BuilderContext>(BUILDER_CONTEXT_ID);
}
