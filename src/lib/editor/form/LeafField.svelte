<script lang="ts">
  import type { SchemaValue } from "$lib/editor/form/utils/schema.js";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import FieldTitle from "./FieldTitle.svelte";
  import EditableField from "./EditableField.svelte";
  import EditableFieldKey from "./EditableFieldKey.svelte";

  export let parseValue: (value: SchemaValue) => SchemaValue;
  export let parseKey: ((key: SchemaValue) => string) | undefined = undefined;
  export let field: UIModelField<string>;
  export let readOnly = false;

  $: label = readOnly
    ? "Document is read-only"
    : `${field.schema.description || ""}${field.is.calculated ? " (calculated)" : ""}`;
</script>

<div class="flex w-full space-x-2 py-1 pl-2 pr-1" title={label}>
  <div class:pointer-events-none={readOnly} class="flex items-start justify-start flex-1">
    <div class="h-8 flex items-center w-full">
      {#if field.is.editableKey}
        <EditableFieldKey {field} {parseKey} {readOnly} on:fieldKeyUpdated />
      {:else}
        <FieldTitle {field} />
      {/if}
    </div>
  </div>
  <div class="flex items-center justify-start w-[350px]">
    <EditableField {field} {parseValue} {readOnly} on:fieldValueUpdated on:fieldKeyUpdated />
  </div>
</div>
