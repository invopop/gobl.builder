<script lang="ts">
  import SchemaField from './SchemaField.svelte'
  import AbstractField from './AbstractField.svelte'
  import { getContext, onDestroy, onMount } from 'svelte'
  import type { Writable } from 'svelte/store'
  import { getBuilderContext } from '$lib/store/builder'
  import type { DynamicFormProps } from '$lib/types/editor'

  const { scrollingSection } = getBuilderContext()

  const scrollPosition = getContext('scrollPosition') as Writable<number>

  let formElement: HTMLElement

  let {
    showSchemaField = false,
    isEmptySchema = false,
    model = undefined,
    readOnly = false,
    onFieldAdded,
    onFieldDeleted,
    onFieldDuplicated,
    onFieldMoved,
    onFieldKeyUpdated,
    onFieldValueUpdated,
    onUiRefreshNeeded
  }: DynamicFormProps = $props()

  const handleScroll = () => {
    $scrollPosition = formElement.scrollTop
  }

  onMount(() => {
    formElement.addEventListener('scroll', handleScroll)
  })

  $effect(() => {
    if ($scrollingSection) return

    formElement.scrollTo(0, $scrollPosition)
  })

  onDestroy(() => {
    formElement.removeEventListener('scroll', handleScroll)
  })
</script>

<div bind:this={formElement} class="h-full overflow-y-auto overflow-x-hidden">
  <div class="pb-40 flex editor-wrapper">
    <div class="w-full max-w-[632px]">
      {#if showSchemaField}
        <SchemaField {isEmptySchema} />
      {:else if model}
        <AbstractField
          field={model}
          {readOnly}
          onFieldAdded={(field) => {
            onUiRefreshNeeded?.(model)
            onFieldAdded?.(field)
          }}
          onFieldDeleted={(field) => {
            onUiRefreshNeeded?.(model)
            onFieldDeleted?.(field)
          }}
          onFieldDuplicated={(field) => {
            onUiRefreshNeeded?.(model)
            onFieldDuplicated?.(field)
          }}
          onFieldMoved={(field) => {
            onUiRefreshNeeded?.(model)
            onFieldMoved?.(field)
          }}
          {onFieldKeyUpdated}
          {onFieldValueUpdated}
        />
      {/if}
    </div>
  </div>
</div>

<style>
  .editor-wrapper {
    justify-content: var(--editor-justify-content, center);
    padding-right: 40px;
    padding-top: var(--editor-padding-top, 12px);
  }
  @media (min-width: 768px) {
    .editor-wrapper {
      padding-left: calc(var(--editor-padding-left, 54px) - 20px);
    }
  }
</style>
