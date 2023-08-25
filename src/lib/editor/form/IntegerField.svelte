<script lang="ts">
  import LeafField from "./LeafField.svelte";
  import type { SchemaValue } from "./utils/schema.js";
  $: props = $$props as any;

  function handleParseValue(value: SchemaValue): number {
    const n = Number.parseInt(`${value || "0"}`, 10);
    return n;
  }
</script>

<LeafField {...props} parseValue={handleParseValue} />
<slot />
