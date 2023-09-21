<script lang="ts">
  import ObjectField from "./ObjectField.svelte";
  import type { UIModelField } from "./utils/model";

  interface PropsInterface {
    field: UIModelField;
  }

  $: props = $$props as PropsInterface;
</script>

<ObjectField {...props} on:fieldAdded on:fieldDeleted on:fieldDuplicated>
  <slot />
</ObjectField>
