<script lang="ts">
  import type { StringFieldProps } from '$lib/types/editor'
  import LeafField from './LeafField.svelte'
  import { UIModelField } from './utils/model'
  import type { SchemaValue } from './utils/schema.js'

  let { field, readOnly, onFieldValueUpdated, onFieldKeyUpdated, children }: StringFieldProps =
    $props()

  function handleParseValue(value: SchemaValue): string {
    return `${value}`
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
