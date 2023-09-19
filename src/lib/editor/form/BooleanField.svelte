<script lang="ts">
  import LeafField from "./LeafField.svelte";
  import type { UIModelField } from "./utils/model";
  import type { SchemaValue } from "./utils/schema.js";

  interface PropsInterface {
    field: UIModelField<string>;
    parseKey: undefined;
  }

  $: props = $$props as PropsInterface;

  function handleParseValue(value: SchemaValue): boolean {
    // Cast string emitted by select as boolean
    return value == "true";
  }
</script>

<LeafField {...props} parseValue={handleParseValue} />
<slot />
