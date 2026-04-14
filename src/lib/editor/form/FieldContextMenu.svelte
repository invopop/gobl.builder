<script lang="ts">
  import { tick } from 'svelte'
  import { Trash } from 'svelte-hero-icons'
  import FieldButtons from '$lib/editor/form/FieldButtons.svelte'
  import FieldButton from '$lib/editor/form/FieldButton.svelte'
  import type { FieldContextMenuProps } from '$lib/types/editor.js'

  let {
    field,
    onFieldAdded,
    onFieldDeleted,
    onFieldDuplicated,
    onFieldMoved
  }: FieldContextMenuProps = $props()

  let parentIsArray = $derived(field.parent?.type === 'array')
  let isArrayStringChildren = $derived(parentIsArray && field.type === 'string')
  let hasAdd = $derived(['object', 'array'].includes(field.type) || isArrayStringChildren)
  let hasDuplicate = $derived(field.is.duplicable && !isArrayStringChildren)
  let hasMove = $derived(parentIsArray)
  let deleteOnly = $derived(!hasAdd && !hasDuplicate && !hasMove && field.is.disposable)

  function handleRemove() {
    field.delete()
    onFieldDeleted?.(field)
  }

  function handleDuplicate() {
    const newField = field.duplicate()
    if (!newField) return

    const focusField = newField.getFirstFocusableChild()

    if (!focusField) return

    focusField.tryFocus()
    onFieldDuplicated?.(newField)
  }

  async function handleModeFieldUp() {
    const destinationField = field.move('up')
    onFieldMoved?.(field)
    await tick()
    destinationField?.tryFocus()
  }

  async function handleModeFieldDown() {
    const destinationField = field.move('down')
    onFieldMoved?.(field)
    await tick()
    destinationField?.tryFocus()
  }
</script>

{#if deleteOnly}
  <FieldButton
    icon={Trash}
    confirmationIcon={Trash}
    tooltipText="Remove"
    isDestructive={true}
    onClick={handleRemove}
  />
{:else}
  <FieldButtons
    {field}
    onAdd={() => onFieldAdded?.(field)}
    onDuplicate={handleDuplicate}
    onDelete={handleRemove}
    onMoveUp={handleModeFieldUp}
    onMoveDown={handleModeFieldDown}
  />
{/if}
