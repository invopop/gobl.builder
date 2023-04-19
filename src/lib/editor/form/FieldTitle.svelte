<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  export let field: UIModelField<unknown>;
</script>

<span class="text-gray-700 font-medium mr-1 whitespace-nowrap" class:capitalize={!field.schema.title}>
  {#if field.parent?.isArray()}
    # {field.key}
  {:else}
    {field.schema.title || field.key}
  {/if}
</span>
