<script lang="ts">
  import LeafField from "./LeafField.svelte";
  import type { SchemaValue } from "./utils/schema.js";
  $: props = $$props as any;

  function handleParseValue(value: SchemaValue): string {
    return `${value}`;
  }
</script>

<LeafField {...props} parseValue={handleParseValue} />
<slot />
