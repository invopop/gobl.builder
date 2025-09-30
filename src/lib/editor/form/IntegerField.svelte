<script lang="ts">
  import type { IntegerFieldProps } from '$lib/types/editor'
  import LeafField from './LeafField.svelte'
  import { UIModelField } from './utils/model'
  import type { SchemaValue } from './utils/schema.js'

  let {
    field,
    readOnly = false,
    children,
    onFieldValueUpdated,
    onFieldKeyUpdated
  }: IntegerFieldProps = $props()

  function handleParseValue(value: SchemaValue): number {
    const n = Number.parseInt(`${value || '0'}`, 10)
    return n
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
