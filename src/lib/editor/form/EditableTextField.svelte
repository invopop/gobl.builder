<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import clsx from "clsx";
  import { createEventDispatcher } from "svelte";
  import { toasts } from "svelte-toasts";

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
    "text-right tabular-nums slashed-zero": ["number", "integer"].includes(fieldType),
    "focus:border-accent-500 border cursor-text": !readOnly,
    "font-medium bg-transparent": readOnly,
  });

  const dispatch = createEventDispatcher();

  function handleBlur(e: FocusEvent) {
    const input = e.target as HTMLDivElement;
    const value = input.innerText;
    dispatch("edit", value);
    dispatch("blur", value);
  }

  async function handleClick(e: Event) {
    if (!readOnly) return;

    const input = e.target as HTMLDivElement;
    await navigator.clipboard.writeText(input.innerText);
    toasts.add({
      type: "success",
      description: "Copied to clipboard",
    });
  }
</script>

<div
  role="textbox"
  tabindex="0"
  contenteditable={!readOnly}
  id={iid}
  on:blur={handleBlur}
  on:keypress
  on:click={handleClick}
  class="{classes} text-base rounded px-3 py-[5px] outline-none w-full caret-accent-500"
>
  {val}
</div>
