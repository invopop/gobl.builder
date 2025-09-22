<script lang="ts">
  import { clsx } from "clsx";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import { Calculator, Hashtag, Icon } from "svelte-hero-icons";
  import type { Schema } from "./utils/schema";

  interface Props {
    field: UIModelField<unknown>;
  }

  let { field }: Props = $props();

  let childrenType = $derived((field.schema.items as Schema)?.type);
  let arrayTitle = $derived(field.schema.title || "");
  let isParent = $derived(["object", "array"].includes(field.type) && childrenType !== "string");
  let isSection = $derived(field.is.root || (field.parent?.is.root && isParent));
  let classes = $derived(clsx({
    "font-medium text-neutral-800": isParent,
    "tracking-normal text-base": isParent && !isSection,
    "text-lg tracking-tighter": isSection,
    "text-neutral-500 text-base tracking-normal": !isSection && !isParent,
  }));
</script>

<span
  class="{classes} whitespace-nowrap flex items-center w-full"
  class:capitalize={!field.schema.title && !field.is.editableKey}
>
  {#if field.parent?.isArray()}
    <span
      class:justify-start={field.type !== "string"}
      class:justify-between={field.type === "string"}
      class="flex items-center w-full"
    >
      <span>
        {#if field.key === "0" && field.type === "string"}
          {field.parent.schema.title || field.parent.key}
        {/if}
      </span>
      <span class="flex items-center">
        <Icon src={Hashtag} class="h-4 w-4" />
        {arrayTitle}
        {Number(field.key) + 1}
      </span>
    </span>
  {:else}
    <span class="flex items-center space-x-1">
      <span>{field.schema.title || field.key}</span>
      {#if field.is.calculated}
        <Icon src={Calculator} class="h-3 w-3" />
      {/if}
    </span>
  {/if}
</span>
