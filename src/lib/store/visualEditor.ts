import { writable } from "svelte/store";

export const activeSection = writable<{ section: null | string; scroll: boolean }>({ section: null, scroll: false });

export const highlightedItem = writable<null | string>(null);

export const activeItem = writable<null | string>(null);
