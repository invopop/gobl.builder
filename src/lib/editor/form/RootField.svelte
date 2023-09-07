<script lang="ts">
  import type { UIModelRootField, UIModelField } from "$lib/editor/form/utils/model.js";
  import AbstractField from "./AbstractField.svelte";
  import SchemaField from "./SchemaField.svelte";
  import { jsonSchema } from "../stores";

  export let field: UIModelRootField;

  const emptyChildren: UIModelField[] = [];
  $: isEmptySchema = field.schema.$comment === "empty-schema";
  $: schemaField = field.children?.find((f) => f.key === "$schema") as UIModelField<string>;
  $: currentSchema = schemaField?.value || "";
  $: isValidSchema = !$jsonSchema || currentSchema === $jsonSchema;
  $: showSchemaField = isEmptySchema || !isValidSchema;
  $: children = field.children?.filter((f) => f.key !== "$schema");
  // @todo: Add title field to schema object on gobl
  $: title = field.schema.title || field.id.split("/").slice(-1);
</script>

<div id={field.id}>
  {#if title != "root" && isValidSchema}
    <h1 class="text-sm capitalize text-grey-4 font-bold p-2">{title}</h1>
  {/if}
  {#if showSchemaField}
    <SchemaField field={schemaField} {isEmptySchema} />
  {:else}
    {#each children || emptyChildren as field (field.id)}
      <AbstractField {field} />
    {/each}
  {/if}
</div>
