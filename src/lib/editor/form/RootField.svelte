<script lang="ts">
  import type { UIModelRootField, UIModelField } from "$lib/editor/form/utils/model.js";
  import AddFieldMenu from "./AddFieldMenu.svelte";
  import AbstractField from "./AbstractField.svelte";
  import CodeError from "./CodeError.svelte";

  export let field: UIModelRootField;

  $: children = field.children || ([] as UIModelField[]);
  // @todo: Add title field to schema object on gobl
  $: title = field.schema.title || field.id.split("/").slice(-1);
</script>

{#if field.is.error}
  <CodeError error={field.error} />
{:else}
  <div id={field.id}>
    <h1 class="text-sm capitalize text-grey-4 font-bold p-2">{title}</h1>
    {#each children as field (field.id)}
      {#if field.key !== "$schema"}
        <AbstractField {field} />
      {/if}
    {/each}
    {#if !field.is.complete}
      <AddFieldMenu {field} showModal={false} showButton={true} />
    {/if}
  </div>
{/if}
