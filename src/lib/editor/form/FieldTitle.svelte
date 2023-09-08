<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import { Hashtag, Icon } from "svelte-hero-icons";
  export let field: UIModelField<unknown>;

  $: arrayTitle = field.schema.title || "";
</script>

<span class="text-grey-4 font-medium whitespace-nowrap flex items-center py-1.5" class:capitalize={!field.schema.title}>
  {#if field.parent?.isArray()}
    <Icon src={Hashtag} class="h-3 text-grey-5 mr-1" /> {arrayTitle} {Number(field.key) + 1}
  {:else}
    <span class:italic={field.is.calculated}>{field.schema.title || field.key}</span>
  {/if}
</span>
