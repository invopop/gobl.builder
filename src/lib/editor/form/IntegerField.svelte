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

  function handleParseValue(value: SchemaValue): number {
    const n = Number.parseInt(`${value || "0"}`, 10);
    return n;
  }
</script>

<LeafField {...props} parseValue={handleParseValue} {readOnly} on:fieldValueUpdated on:fieldKeyUpdated />
<slot />
