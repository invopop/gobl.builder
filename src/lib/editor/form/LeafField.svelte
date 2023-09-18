<script lang="ts">
  import type { SchemaValue } from "$lib/editor/form/utils/schema.js";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import FieldTitle from "./FieldTitle.svelte";
  import EditableField from "./EditableField.svelte";
  import EditableFieldKey from "./EditableFieldKey.svelte";

  export let parseValue: (value: SchemaValue) => SchemaValue;
  export let parseKey: ((key: SchemaValue) => string) | undefined = undefined;
  export let field: UIModelField<string>;
  $: label = `${field.schema.description || ""}${field.is.calculated ? " (calculated)" : ""}`;
</script>

<div class="flex items-stretch justify-between w-full gap-2" title={label}>
  <div class="flex items-center justify-start">
    {#if field.is.editableKey}
      <EditableFieldKey {field} {parseKey} />
    {:else}
      <FieldTitle {field} />
    {/if}
  </div>
  <div class="flex items-center justify-start w-[248px]">
    <EditableField {field} {parseValue} />
  </div>
</div>
