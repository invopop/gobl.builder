<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import clsx from "clsx";
  import { createEventDispatcher } from "svelte";

  export let field: UIModelField<string>;
  export let showError = false;
  export let readOnly = false;

  $: classes = clsx({
    "bg-neutral-50 border-slate-100 text-neutral-500": field.is.calculated && !readOnly,
    "text-neutral-800": readOnly || (!field.is.calculated && !showError),
    "border-danger-200 focus:border-danger-200 text-danger-500": showError,
    "border focus:border-accent-500": !readOnly,
    "font-medium bg-transparent": readOnly,
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
  type={readOnly ? "text" : "date"}
  id={field.id}
  value={field.value}
  on:change={handleChange}
  on:keyup={handleChange}
  on:blur={handleBlur}
  disabled={readOnly}
  class="{classes} text-base outline-none w-full rounded h-[32px] px-3"
/>
