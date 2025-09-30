<script lang="ts">
  import type { UIModelField } from '$lib/editor/form/utils/model.js'
  import type { RootFieldProps } from '$lib/types/editor'
  import AbstractField from './AbstractField.svelte'
  import SectionWrapper from './SectionWrapper.svelte'
  import type { Schema } from './utils/schema'

  let {
    field,
    readOnly = false,
    onFieldAdded,
    onFieldDeleted,
    onFieldDuplicated,
    onFieldMoved,
    onFieldValueUpdated,
    onFieldKeyUpdated
  }: RootFieldProps = $props()

  const emptyChildren: UIModelField[] = []

  let children = $derived(field.children?.filter((f) => f.key !== '$schema') || emptyChildren)
  // @todo: Add title field to schema object on gobl
  let complexFields = $derived(
    children.filter((f) => {
      if ((f.schema.items as Schema)?.type === 'string') {
        return false
      }
      return ['array', 'object'].includes(f.type)
    })
  )
  let simpleFields = $derived(
    children.filter((f) => {
      if ((f.schema.items as Schema)?.type === 'string') {
        return true
      }
      return !['array', 'object'].includes(f.type)
    })
  )
</script>

<SectionWrapper {readOnly} {field}>
  {#each simpleFields as field (field.id)}
    <AbstractField
      {field}
      {readOnly}
      {onFieldAdded}
      {onFieldDeleted}
      {onFieldDuplicated}
      {onFieldMoved}
      {onFieldValueUpdated}
      {onFieldKeyUpdated}
    />
  {/each}

  {#snippet extraContent()}
    <div>
      {#each complexFields as field (field.id)}
        <AbstractField
          {field}
          {readOnly}
          {onFieldAdded}
          {onFieldDeleted}
          {onFieldDuplicated}
          {onFieldMoved}
          {onFieldValueUpdated}
          {onFieldKeyUpdated}
        />
      {/each}
    </div>
  {/snippet}
</SectionWrapper>
