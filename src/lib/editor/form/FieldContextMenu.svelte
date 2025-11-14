<script lang="ts">
  import { tick } from 'svelte'
  import FieldButtons from '$lib/editor/form/FieldButtons.svelte'
  import { Icon } from 'svelte-hero-icons'
  import { Options } from '@invopop/ui-icons'
  import type { FieldContextMenuProps } from '$lib/types/editor.js'

  let showButtons = $state(false)

  let {
    field,
    onFieldAdded,
    onFieldDeleted,
    onFieldDuplicated,
    onFieldMoved
  }: FieldContextMenuProps = $props()

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

  function handleHover() {
    showButtons = true
  }

  function handleBlur() {
    showButtons = false
  }
</script>

<div class="relative">
  <button onmouseenter={handleHover} class="p-1 rounded border border-border">
    <Icon src={Options} class="h-4 w-4 text-foreground" />
  </button>
  {#if showButtons}
    <button onmouseleave={handleBlur} class="absolute top-[-4px] right-[-4px]">
      <FieldButtons
        {field}
        onAdd={() => onFieldAdded?.(field)}
        onDuplicate={handleDuplicate}
        onDelete={handleRemove}
        onMoveUp={handleModeFieldUp}
        onMoveDown={handleModeFieldDown}
      />
    </button>
  {/if}
</div>
