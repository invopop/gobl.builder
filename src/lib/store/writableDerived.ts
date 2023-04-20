import type { Readable, Unsubscriber, Writable } from "svelte/store";
import { derived } from "svelte/store";

// @todo: Imported this types from svelte instead
type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>] | Array<Readable<any>>;
type StoresValues<T> = T extends Readable<infer U>
  ? U
  : {
      [K in keyof T]: T[K] extends Readable<infer U> ? U : never;
    };

export function writableDerived<S extends Stores, T>(
  stores: S,
  fn: (values: StoresValues<S>, set: (value: T) => void) => Unsubscriber | void,
  initial_value?: T
): Writable<T>;
export function writableDerived<S extends Stores, T>(
  stores: S,
  fn: (values: StoresValues<S>) => T,
  initial_value?: T
): Writable<T>;
export function writableDerived<S extends Stores, T>(stores: S, fn: (values: StoresValues<S>) => T): Writable<T>;
export function writableDerived<S extends Stores, T>(
  stores: S,
  fn: ((values: StoresValues<S>) => T) | ((values: StoresValues<S>, set: (value: T) => void) => Unsubscriber | void),
  initial_value?: T
): Writable<T> {
  const ref = {
    value: initial_value as T,
    set: (v: T) => {
      // noop
    },
  };

  const derivedStore = derived<S, T>(
    stores,
    (values: StoresValues<S>, set: (value: T) => void) => {
      function wrappedSet(value: T) {
        ref.set = set;
        ref.value = value;
        set(value);
      }

      const ret = fn(values, wrappedSet);
      if (ret && typeof ret !== "function") wrappedSet(ret);
    },
    initial_value
  );

  return {
    subscribe: derivedStore.subscribe,
    update(updater) {
      const value = updater(ref.value);
      ref.set(value);
    },
    set(value) {
      ref.set(value);
    },
  };
}
