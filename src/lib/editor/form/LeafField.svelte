<script lang="ts">
  import type { SchemaValue } from "$lib/editor/form/utils/schema.js";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import FieldTitle from "./FieldTitle.svelte";
  import EditableField from "./EditableField.svelte";
  import EditableFieldKey from "./EditableFieldKey.svelte";
  import CalculatedField from "./CalculatedField.svelte";

  export let parseValue: (value: SchemaValue) => SchemaValue;
  export let parseKey: ((key: SchemaValue) => string) | undefined = undefined;
  export let field: UIModelField<string>;
</script>

<Tooltip label={field.schema.description} delay={200} containerClass="block w-full">
  <div class="flex items-stretch justify-between w-full gap-2 h-8">
    <div class="flex items-center justify-start">
      {#if field.is.editableKey}
        <EditableFieldKey {field} {parseKey} />
      {:else}
        <FieldTitle {field} />
      {/if}
    </div>
    <div class="flex items-center justify-start w-96">
      {#if field.is.editable}
        <EditableField {field} {parseValue} />
      {:else if field.is.calculated}
        <CalculatedField {field} />
      {/if}
    </div>
  </div>
</Tooltip>
