<script lang="ts">
  import type { ArrayFieldProps } from '$lib/types/editor'
  import ObjectField from './ObjectField.svelte'

  let {
    field,
    readOnly,
    onFieldAdded,
    onFieldDeleted,
    onFieldDuplicated,
    onFieldMoved,
    onFieldValueUpdated,
    onFieldKeyUpdated
  }: ArrayFieldProps = $props()
</script>

<ObjectField
  {field}
  {readOnly}
  {onFieldAdded}
  {onFieldDeleted}
  {onFieldDuplicated}
  {onFieldMoved}
  {onFieldValueUpdated}
  {onFieldKeyUpdated}
/>
