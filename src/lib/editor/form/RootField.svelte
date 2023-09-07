<script lang="ts">
  import type { UIModelRootField, UIModelField } from "$lib/editor/form/utils/model.js";
  import AbstractField from "./AbstractField.svelte";
  import SchemaField from "./SchemaField.svelte";
  import { jsonSchema } from "../stores";

  export let field: UIModelRootField;

  const emptyChildren: UIModelField[] = [];
  $: isEmptySchema = field.schema.$comment === "empty-schema";
  $: currentSchema = field.children?.find((f) => f.key === "$schema")?.value || "";
  $: isValidSchema = !$jsonSchema || currentSchema === $jsonSchema;
  $: children =
    isEmptySchema || !isValidSchema
      ? field.children?.filter((f) => f.key === "$schema")
      : field.children?.filter((f) => f.key !== "$schema");
  // @todo: Add title field to schema object on gobl
  $: title = field.schema.title || field.id.split("/").slice(-1);
</script>

<div id={field.id}>
  {#if title != "root" && isValidSchema}
    <h1 class="text-sm capitalize text-grey-4 font-bold p-2">{title}</h1>
  {/if}
  {#each children || emptyChildren as field (field.id)}
    {#if field.key === "$schema"}
      <SchemaField {field} {isEmptySchema} />
    {:else}
      <AbstractField {field} />
    {/if}
  {/each}
</div>
