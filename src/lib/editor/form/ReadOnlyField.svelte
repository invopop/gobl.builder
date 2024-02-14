<script lang="ts">
  import { toasts } from "svelte-toasts";
  import type { UIModelField } from "./utils/model";
  import clsx from "clsx";

  export let field: UIModelField;

  $: fieldType = Array.isArray(field.schema.type) ? field.schema.type[0] : field.schema.type || "";
  $: classes = clsx({
    "text-right tabular-nums slashed-zero": ["number", "integer"].includes(fieldType),
    "text-left": !["number", "integer"].includes(fieldType),
  });

  $: value = getValue(field.value as string);

  function getValue(value: string): string {
    if (field.controlType === "select") {
      const option = field.controlMeta.find((o: { key: string; value: string }) => o.value === value);
      return option ? option.key : "";
    }

    if (field.controlType === "date") {
      const dateObject = new Date(value);

      return dateObject.toLocaleDateString(Intl.DateTimeFormat().resolvedOptions().locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }

    return value;
  }

  async function handleClick() {
    await navigator.clipboard.writeText(value);
    toasts.add({
      type: "success",
      description: "Copied to clipboard",
    });
  }
</script>

<button
  id={field.id}
  on:click={handleClick}
  class="{classes} font-medium text-neutral-800 text-base px-3 outline-none w-full tracking-tight"
>
  {value}
</button>
