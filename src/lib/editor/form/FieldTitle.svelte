<script lang="ts">
  import { clsx } from "clsx";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import { Calculator, Hashtag, Icon } from "svelte-hero-icons";

  export let field: UIModelField<unknown>;

  $: arrayTitle = field.schema.title || "";
  $: isParent = ["object", "array"].includes(field.type);
  $: isSection = field.is.root || (field.parent?.is.root && isParent);
  $: classes = clsx({
    "font-semibold text-neutral-900 text-base": isParent,
    "tracking-tight": isParent && !isSection,
    "text-xl text-neutral-900 tracking-tighter": isSection,
    "text-neutral-500 text-sm tracking-normal truncate": !isSection && !isParent,
  });
</script>

<span
  class="{classes} whitespace-nowrap flex items-center"
  class:capitalize={!field.schema.title && !field.is.editableKey}
>
  {#if field.parent?.isArray()}
    <span class="flex items-center justify-start">
      <Icon src={Hashtag} class="h-4 w-4" />
      {arrayTitle}
      {Number(field.key) + 1}
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
