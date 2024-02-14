<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import clsx from "clsx";
  import { createEventDispatcher } from "svelte";

  export let field: UIModelField<string>;
  export let showError = false;

  $: classes = clsx({
    "bg-neutral-50 border-slate-100 text-neutral-500": field.is.calculated,
    "text-neutral-800": !field.is.calculated && !showError,
    "border-danger-200 focus:border-danger-200 text-danger-500": showError,
  });

  const dispatch = createEventDispatcher();

  function handleChange(e: Event & { currentTarget: HTMLInputElement }) {
    const value = e.currentTarget.value;
    dispatch("edit", value);
  }

  function handleBlur(e: Event & { currentTarget: HTMLInputElement }) {
    const value = e.currentTarget.value;
    dispatch("blur", value);
  }
</script>

<input
  type="date"
  id={field.id}
  value={field.value}
  on:change={handleChange}
  on:keyup={handleChange}
  on:blur={handleBlur}
  class="{classes} border focus:border-accent-500 text-base outline-none w-full rounded h-[32px] px-3 tracking-tight"
/>

<style>
  input[type="date"]::-webkit-calendar-picker-indicator {
    background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9IjE2eDE2IC8gQ2FsZW5kYXIiPgo8cGF0aCBpZD0iU2hhcGUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNSAxLjVDNS4yNzYxNCAxLjUgNS41IDEuNzIzODYgNS41IDJWMi41SDEwLjVWMkMxMC41IDEuNzIzODYgMTAuNzIzOSAxLjUgMTEgMS41QzExLjI3NjEgMS41IDExLjUgMS43MjM4NiAxMS41IDJWMi41QzEzLjE1NjkgMi41IDE0LjUgMy44NDMxNSAxNC41IDUuNVYxMS41QzE0LjUgMTMuMTU2OSAxMy4xNTY5IDE0LjUgMTEuNSAxNC41SDQuNUMyLjg0MzE1IDE0LjUgMS41IDEzLjE1NjkgMS41IDExLjVWNS41QzEuNSAzLjg0MzE1IDIuODQzMTUgMi41IDQuNSAyLjVWMkM0LjUgMS43MjM4NiA0LjcyMzg2IDEuNSA1IDEuNVpNMTAuNSAzLjVWNEMxMC41IDQuMjc2MTQgMTAuNzIzOSA0LjUgMTEgNC41QzExLjI3NjEgNC41IDExLjUgNC4yNzYxNCAxMS41IDRWMy41QzEyLjYwNDYgMy41IDEzLjUgNC4zOTU0MyAxMy41IDUuNUgyLjVDMi41IDQuMzk1NDMgMy4zOTU0MyAzLjUgNC41IDMuNVY0QzQuNSA0LjI3NjE0IDQuNzIzODYgNC41IDUgNC41QzUuMjc2MTQgNC41IDUuNSA0LjI3NjE0IDUuNSA0VjMuNUgxMC41Wk0yLjUgNi41VjExLjVDMi41IDEyLjYwNDYgMy4zOTU0MyAxMy41IDQuNSAxMy41SDExLjVDMTIuNjA0NiAxMy41IDEzLjUgMTIuNjA0NiAxMy41IDExLjVWNi41SDIuNVoiIGZpbGw9IiM3RTdGN0YiLz4KPC9nPgo8L3N2Zz4K");
    width: 16px;
    height: 16px;
  }
</style>
