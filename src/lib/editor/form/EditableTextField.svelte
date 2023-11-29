<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import clsx from "clsx";
  import { createEventDispatcher } from "svelte";

  export let field: UIModelField<string>;
  export let showError = false;
  export let classes = "";
  export let value = "";
  export let id = "";
  export let readOnly = false;

  $: iid = id || field.id;
  $: val = value || field.value;
  $: fieldType = Array.isArray(field.schema.type) ? field.schema.type[0] : field.schema.type || "";
  $: classes = clsx({
    "bg-neutral-50 border-slate-100 text-neutral-500": field.is.calculated && !readOnly,
    "text-neutral-800": readOnly || (!field.is.calculated && !showError),
    "border-danger-200 focus:border-danger-200 text-danger-500": showError,
    "text-right": ["number", "integer"].includes(fieldType),
    "focus:border-accent-500 border": !readOnly,
    "font-medium": readOnly,
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
  type="text"
  id={iid}
  value={val}
  on:change={handleChange}
  on:keyup={handleChange}
  on:blur={handleBlur}
  on:keypress
  class="{classes} text-base rounded px-3 h-[32px] outline-none w-full caret-accent-500"
/>
