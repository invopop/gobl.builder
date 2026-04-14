<script lang="ts">
  import type { Component } from 'svelte'
  import ObjectField from './ObjectField.svelte'
  import ArrayField from './ArrayField.svelte'
  import StringField from './StringField.svelte'
  import FallbackField from './FallbackField.svelte'
  import FieldContextMenu from './FieldContextMenu.svelte'
  import hover from './action/hover.js'
  import IntegerField from './IntegerField.svelte'
  import type { UIModelField } from './utils/model.js'
  import AddFieldMenu from './AddFieldMenu.svelte'
  import BooleanField from './BooleanField.svelte'
  import clsx from 'clsx'
  import { getBuilderContext } from '$lib/store/builder'
  import type { Schema } from './utils/schema'
  import type { AbstractFieldProps } from '$lib/types/editor'

  const { activeItem, highlightedItem } = getBuilderContext()

  const componentsMap: Record<string, Component<AbstractFieldProps>> = {
    object: ObjectField,
    array: ArrayField,
    string: StringField,
    number: StringField,
    integer: IntegerField,
    boolean: BooleanField
  }

  let showAddMenu = $state(false)
  let addMenuRef: HTMLElement | undefined = $state()

  let {
    field,
    readOnly = false,
    onFieldAdded,
    onFieldDeleted,
    onFieldDuplicated,
    onFieldMoved,
    onFieldValueUpdated,
    onFieldKeyUpdated
  }: AbstractFieldProps = $props()

  let childrenType = $derived((field.schema.items as Schema)?.type)
  let isHover = $derived($activeItem === field.id)
  let highlight = $derived($highlightedItem === field.id)
  let contextMenuOffset = $derived.by(() => {
    if (!showAddMenu || !addMenuRef) {
      return 0
    }
    const { height, top } = addMenuRef.getBoundingClientRect()
    const offset = top + height - window.innerHeight
    return offset > 0 ? offset : 0
  })

  let isParent = $derived(['object', 'array'].includes(field.type) && childrenType !== 'string')
  let isSection = $derived(isParent && field.parent?.is.root)
  let wrapperClasses = $derived(
    clsx({
      'bg-background-default-secondary': isHover && !isParent,
      'rounded-r': readOnly && !isParent,
      'pl-2': isParent && !isSection
    })
  )
  let classes = $derived(
    clsx({
      'border-border-selected-bold': highlight,
      'border-border-default-secondary': !highlight,
      'border-l border-t border-b': childrenType !== 'string'
    })
  )
  let contextMenuClasses = $derived(
    clsx({
      'mt-1': isParent && !isSection && !field.is.root
    })
  )

  function handleHover(e: CustomEvent<boolean>) {
    $activeItem = e.detail ? field.id : null

    if (!e.detail) return

    $highlightedItem = isParent ? field.id : field.parent?.id || null
  }

  function handleFocusIn(e: FocusEvent) {
    e.stopPropagation()

    $activeItem = field.id
    $highlightedItem = isParent ? field.id : field.parent?.id || null
  }

  function handleAddField() {
    showAddMenu = false

    // Children of string arrays can add items directly from the row
    if (field.type === 'string' && field.parent?.type === 'array') {
      addFieldToArray(field.parent)
      return
    }

    // @note: Add field directly instead of showing the dropdown option list
    if (field.type === 'array' || field.controlType === 'dictionary') {
      addFieldToArray(field)
      return
    }

    showAddMenu = true
  }

  function addFieldToArray(f: UIModelField) {
    const [childOption] = f.options || []

    const newField = f.addChildField(childOption)
    if (!newField) return
    newField.tryFocus()
    onFieldAdded?.(newField)
  }

  function focusNextField(nextField = field.getNextFocusableField()) {
    if (!nextField) return
    nextField.tryFocus(5, 0)
  }

  function focusPrevField(prevField = field.getPrevFocusableField()) {
    if (!prevField) return
    prevField.tryFocus(5, 0)
  }

  function handleKeyDown(e: KeyboardEvent) {
    e.stopPropagation()

    const goPrev = e.key === 'ArrowUp' || (e.shiftKey && e.key === 'Tab')
    const goNext = e.key === 'ArrowDown' || (!e.shiftKey && e.key === 'Tab')
    const goAdd = e.key === 'Enter'
    const blur = e.key === 'Escape'

    if (blur) {
      ;(e.target as HTMLElement)?.blur()
    } else if (goAdd) {
      const nextItem = field.getNextFocusableField()

      // @note: Last item but the parent is not complete, show the add field menu
      if (nextItem?.isContainer() && !field.is.complete) {
        return handleAddField()
      } else {
        return focusNextField(nextItem)
      }
    } else if (goNext) {
      e.preventDefault()

      const elementId = (e.target as HTMLElement)?.id || ''
      const isKeyField = elementId.includes('-key')

      if (isKeyField) {
        return focusNextField(field)
      }

      return focusNextField()
    } else if (goPrev) {
      e.preventDefault()
      return focusPrevField()
    }
  }

  const AbstractComponent = $derived(componentsMap[field.type] || FallbackField)
</script>

<svelte:window />

{#if isSection}
  <div class="my-4 mx-2 border-b border-transparent hr-separator"></div>
{/if}

<div
  role="button"
  tabindex="0"
  class="relative rounded expanded-area cursor-default"
  use:hover
  onhover={handleHover}
  onkeydown={handleKeyDown}
  onfocusin={handleFocusIn}
>
  <div
    class="{wrapperClasses} rounded-l flex transition-colors duration-150 ease-in-out"
    class:my-1={isParent}
    class:relative={isParent}
  >
    {#if isParent && !isSection && !field.is.root}
      <div
        class="{classes} w-2 flex-none rounded-l transition-colors duration-150 ease-in-out"
      ></div>
    {/if}
    <div class="flex-1">
      <AbstractComponent
        {field}
        {readOnly}
        {onFieldAdded}
        {onFieldDeleted}
        {onFieldDuplicated}
        {onFieldMoved}
        {onFieldValueUpdated}
        {onFieldKeyUpdated}
      />
    </div>
    {#if isParent && !readOnly}
      <div class="{contextMenuClasses} absolute top-1 right-1 z-10 context-actions">
        <FieldContextMenu
          {field}
          onFieldAdded={handleAddField}
          {onFieldDeleted}
          {onFieldDuplicated}
          {onFieldMoved}
        />
      </div>
    {/if}
    {#if showAddMenu}
      <div
        class="absolute top-12 right-0 w-64 z-20"
        style={`margin-top: -${contextMenuOffset}px`}
        bind:this={addMenuRef}
      >
        <AddFieldMenu {onFieldAdded} {field} onCloseAddFieldMenu={() => (showAddMenu = false)} />
      </div>
    {/if}
  </div>
  {#if !isParent && !readOnly && childrenType !== 'string'}
    <div class="absolute top-0 right-0 w-7 h-10 -mr-7 bg-transparent">
      <span
        class="{contextMenuClasses} absolute top-0 right-0 pt-[7px] pb-[5.5px] bg-background rounded context-actions"
      >
        <FieldContextMenu
          {field}
          onFieldAdded={handleAddField}
          {onFieldDeleted}
          {onFieldDuplicated}
          {onFieldMoved}
        />
      </span>
    </div>
  {/if}
</div>

<style>
  .context-actions {
    visibility: hidden;
  }

  .expanded-area:hover:not(:has(.expanded-area:hover)) > :global(.context-actions),
  .expanded-area:hover:not(:has(.expanded-area:hover)) > * > :global(.context-actions) {
    visibility: visible;
  }

  .hr-separator {
    border-image: repeating-linear-gradient(
      90deg,
      #cccece,
      #cccece 3px,
      transparent 3px,
      transparent 7px
    );
    border-image-slice: 1;
  }
</style>
