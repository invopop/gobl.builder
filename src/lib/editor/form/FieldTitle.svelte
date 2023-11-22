<script lang="ts">
  import { clsx } from "clsx";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import { Hashtag, Icon } from "svelte-hero-icons";

  export let field: UIModelField<unknown>;
  export let isSection = false;

  $: arrayTitle = field.schema.title || "";
  $: classes = clsx({
    "font-semibold text-neutral-900": ["object", "array"].includes(field.type),
    "text-xl text-neutral-900 py-2": isSection,
    "text-neutral-500": !isSection,
  });
</script>

<span class="{classes} whitespace-nowrap flex items-center" class:capitalize={!field.schema.title}>
  {#if field.parent?.isArray()}
    <span class="flex items-center justify-start w-8">
      <Icon src={Hashtag} class="h-3 text-grey-5 mr-1" />
      {arrayTitle}
      {Number(field.key) + 1}
    </span>
  {:else}
    <span class:italic={field.is.calculated}>{field.schema.title || field.key}</span>
  {/if}
</span>
