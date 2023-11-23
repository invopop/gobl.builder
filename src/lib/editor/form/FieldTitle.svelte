<script lang="ts">
  import { clsx } from "clsx";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import { Hashtag, Icon } from "svelte-hero-icons";

  export let field: UIModelField<unknown>;
  export let isSection = false;

  $: arrayTitle = field.schema.title || "";
  $: isParent = ["object", "array"].includes(field.type);
  $: classes = clsx({
    "font-semibold text-neutral-900": isParent,
    "text-xl text-neutral-900 py-2": isSection,
    "text-neutral-500 text-sm": !isSection && !isParent,
  });
</script>

<span class="{classes} whitespace-nowrap flex items-center" class:capitalize={!field.schema.title}>
  {#if field.parent?.isArray()}
    <span class="flex items-center justify-start">
      <Icon src={Hashtag} class="h-4" />
      {arrayTitle}
      {Number(field.key) + 1}
    </span>
  {:else}
    <span class:italic={field.is.calculated}>{field.schema.title || field.key}</span>
  {/if}
</span>
