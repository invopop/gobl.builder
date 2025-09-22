<!-- @migration-task Error while migrating Svelte code: migrating this component would require adding a `$props` rune but there's already a variable named props.
     Rename the variable and try again or migrate by hand. -->
<!-- @migration-task Error while migrating Svelte code: migrating this component would require adding a `$props` rune but there's already a variable named props.
     Rename the variable and try again or migrate by hand. -->
<script lang="ts">
  import ObjectField from "./ObjectField.svelte";
  import type { UIModelField } from "./utils/model";

  interface PropsInterface {
    field: UIModelField;
  }

  $: props = $$props as PropsInterface;
</script>

<ObjectField
  {...props}
  on:fieldAdded
  on:fieldDeleted
  on:fieldDuplicated
  on:fieldMoved
  on:fieldValueUpdated
  on:fieldKeyUpdated
/>
