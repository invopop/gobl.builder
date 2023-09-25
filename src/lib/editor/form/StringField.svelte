<script lang="ts">
  import LeafField from "./LeafField.svelte";
  import type { UIModelField } from "./utils/model";
  import type { SchemaValue } from "./utils/schema.js";

  interface PropsInterface {
    field: UIModelField<string>;
    parseKey: undefined;
  }

  export let readOnly = false;

  $: props = $$props as PropsInterface;

  function handleParseValue(value: SchemaValue): string {
    return `${value}`;
  }
</script>

<LeafField {...props} parseValue={handleParseValue} {readOnly} on:fieldValueUpdated on:fieldKeyUpdated />
<slot />
