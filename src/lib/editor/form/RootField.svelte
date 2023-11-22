<script lang="ts">
  import type { UIModelRootField, UIModelField } from "$lib/editor/form/utils/model.js";
  import AbstractField from "./AbstractField.svelte";
  import { currentEditorSchema, jsonSchema } from "../stores";

  export let field: UIModelRootField;
  export let readOnly = false;

  const emptyChildren: UIModelField[] = [];
  $: isValidSchema = !$jsonSchema || $currentEditorSchema === $jsonSchema;
  $: children = field.children?.filter((f) => f.key !== "$schema");
  // @todo: Add title field to schema object on gobl
  $: title = field.schema.title || field.id.split("/").slice(-1);
</script>

<div id={field.id}>
  {#if title != "root" && isValidSchema}
    <h1 class="text-xl capitalize text-grey-4 font-semibold p-2">{title}</h1>
  {/if}
  {#each children || emptyChildren as field (field.id)}
    <AbstractField
      {field}
      {readOnly}
      on:fieldAdded
      on:fieldDeleted
      on:fieldDuplicated
      on:fieldMoved
      on:fieldValueUpdated
      on:fieldKeyUpdated
    />
  {/each}
</div>
