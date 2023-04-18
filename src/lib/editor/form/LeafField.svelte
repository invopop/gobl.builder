<script lang="ts">
  import type { SchemaValue } from "$lib/editor/form/utils/schema.js";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import FieldTitle from "./FieldTitle.svelte";
  import EditableField from "./EditableField.svelte";
  import CalculatedField from "./CalculatedField.svelte";

  export let parseValue: (value: SchemaValue) => SchemaValue;
  export let field: UIModelField<string>;
</script>

<Tooltip label={field.schema.description} delay={300} containerClass="block w-full">
  <div class="flex justify-between items-start w-full gap-2">
    <div class="py-1.5">
      <FieldTitle {field} />
    </div>
    <div class="w-96">
      {#if field.is.editable}
        <EditableField {field} {parseValue} />
      {:else if field.is.calculated}
        <CalculatedField {field} />
      {/if}
    </div>
  </div>
</Tooltip>
