<script lang="ts">
  import type { UIModelField, UIModelRootField } from '$lib/editor/form/utils/model.js'
  import type { ObjectFieldProps } from '$lib/types/editor'
  import AbstractField from './AbstractField.svelte'
  import RootField from './RootField.svelte'
  import SectionWrapper from './SectionWrapper.svelte'

  let {
    field,
    readOnly,
    onFieldAdded,
    onFieldDeleted,
    onFieldDuplicated,
    onFieldMoved,
    onFieldValueUpdated,
    onFieldKeyUpdated
  }: ObjectFieldProps = $props()

  let children = $derived(field.children || ([] as UIModelField[]))
</script>

{#if field.is.root}
  <RootField
    field={field as UIModelRootField}
    {readOnly}
    {onFieldAdded}
    {onFieldDeleted}
    {onFieldDuplicated}
    {onFieldMoved}
    {onFieldValueUpdated}
    {onFieldKeyUpdated}
  />
{:else}
  <SectionWrapper {readOnly} {field}>
    {#each children as childField (childField.id)}
      <AbstractField
        field={childField}
        {readOnly}
        {onFieldAdded}
        {onFieldDeleted}
        {onFieldDuplicated}
        {onFieldMoved}
        {onFieldValueUpdated}
        {onFieldKeyUpdated}
      />
    {/each}
  </SectionWrapper>
{/if}
