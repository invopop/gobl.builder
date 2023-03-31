import { writable } from "svelte/store";

export function reducible<S, A, R extends (state: S, action: A) => S>(state: S, reducer: R) {
  const { update, subscribe } = writable(state);

  function dispatch(action: A) {
    update((state) => reducer(state, action));
  }

  return [{ subscribe }, dispatch];
}
