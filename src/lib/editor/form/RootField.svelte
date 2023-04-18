<script lang="ts">
  import type { UIModelRootField, UIModelField } from "$lib/editor/form/utils/model.js";
  import AddFieldMenu from "./AddFieldMenu.svelte";
  import AbstractField from "./AbstractField.svelte";
  import CodeError from "./CodeError.svelte";

  export let field: UIModelRootField;
  $: childs = field.children || ([] as UIModelField[]);
</script>

{#if field.is.error}
  <CodeError error={field.error} />
{:else}
  <div class="bg-slate-100 border border-slate-200 p-8 rounded-md">
    {#each childs as field (field.key)}
      <AbstractField {field} />
    {/each}
    {#if !field.is.complete}
      <AddFieldMenu {field} />
    {/if}
  </div>
{/if}
