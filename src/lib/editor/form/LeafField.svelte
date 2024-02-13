<script lang="ts">
  import type { SchemaValue } from "$lib/editor/form/utils/schema.js";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import FieldTitle from "./FieldTitle.svelte";
  import EditableField from "./EditableField.svelte";
  import EditableFieldKey from "./EditableFieldKey.svelte";
  import clsx from "clsx";

  export let parseValue: (value: SchemaValue) => SchemaValue;
  export let parseKey: ((key: SchemaValue) => string) | undefined = undefined;
  export let field: UIModelField<string>;
  export let readOnly = false;

  $: label = readOnly
    ? "Document is read-only"
    : `${field.schema.description || ""}${field.is.calculated ? " (calculated)" : ""}`;

  $: classes = clsx({
    "py-[3px]": readOnly,
    "py-1": !readOnly,
  });
</script>

<div class="{classes} flex w-full space-x-2 pl-2 pr-1" title={label}>
  <div class="flex items-center justify-start flex-1">
    <div class="flex items-center w-full">
      {#if field.is.editableKey}
        <EditableFieldKey {field} {parseKey} {readOnly} on:fieldKeyUpdated />
      {:else}
        <FieldTitle {field} />
      {/if}
    </div>
  </div>
  <div class="flex items-center justify-start w-[300px] @[1055px]:w-[350px]">
    <EditableField {field} {parseValue} {readOnly} on:fieldValueUpdated on:fieldKeyUpdated />
  </div>
</div>
