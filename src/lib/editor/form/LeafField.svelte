<script lang="ts">
  import type { SchemaValue } from "$lib/editor/form/utils/schema.js";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import FieldTitle from "./FieldTitle.svelte";
  import EditableField from "./EditableField.svelte";
  import EditableFieldKey from "./EditableFieldKey.svelte";
  import clsx from "clsx";

  interface Props {
    parseValue: (value: SchemaValue) => SchemaValue;
    parseKey?: ((key: SchemaValue) => string) | undefined;
    field: UIModelField<string>;
    readOnly?: boolean;
  }

  let {
    parseValue,
    parseKey = undefined,
    field,
    readOnly = false
  }: Props = $props();

  let label = $derived(readOnly
    ? "Document is read-only"
    : `${field.schema.description || ""}${field.is.calculated ? " (calculated)" : ""}`);

  let classes = $derived(clsx({
    "py-2.5": readOnly,
    "py-1": !readOnly,
  }));

  let innerClasses = $derived(clsx({
    "h-5": readOnly,
    "h-8": !readOnly,
  }));
</script>

<div class="{classes} flex w-full space-x-2 pl-3 pr-1" title={label}>
  <div class="flex items-start justify-start flex-1">
    <div class="{innerClasses} flex items-center w-full max-w-[160px] @[780px]:max-w-full">
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
