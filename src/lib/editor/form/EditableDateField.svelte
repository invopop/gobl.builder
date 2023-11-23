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
  class="{classes} outline-none w-full border rounded py-1.5 px-3 focus:border-accent-500"
/>
