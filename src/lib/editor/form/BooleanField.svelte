<script lang="ts">
  import type { BooleanFieldProps } from '$lib/types/editor'
  import LeafField from './LeafField.svelte'
  import { UIModelField } from './utils/model'
  import type { SchemaValue } from './utils/schema.js'

  let { field, readOnly, children, onFieldValueUpdated, onFieldKeyUpdated }: BooleanFieldProps =
    $props()

  function handleParseValue(value: SchemaValue): boolean {
    // Cast string emitted by select as boolean
    return value == 'true'
  }
</script>

<LeafField
  field={field as UIModelField<string>}
  {readOnly}
  parseValue={handleParseValue}
  {onFieldValueUpdated}
  {onFieldKeyUpdated}
/>
{@render children?.()}
