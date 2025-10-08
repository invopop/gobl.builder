<script lang="ts">
  import { Trash, DocumentDuplicate, ArrowUp, ArrowDown, Plus } from 'svelte-hero-icons'
  import FieldButton from './FieldButton.svelte'
  import { Options } from '@invopop/ui-icons'
  import type { FieldButtonsProps } from '$lib/types/editor'

  let {
    field = undefined,
    onAdd,
    onDelete,
    onDuplicate,
    onMoveDown,
    onMoveUp
  }: FieldButtonsProps = $props()

  let parentIsArray = $derived(field?.parent?.type === 'array')
  let isArrayStringChildren = $derived(parentIsArray && field?.type === 'string')
  let showAdd = $derived(['object', 'array'].includes(field?.type || '') || isArrayStringChildren)
  let addLabel = $derived(field?.type === 'array' ? 'Add Row' : 'Add Property')
  let canDuplicate = $derived(field?.is.duplicable && !isArrayStringChildren)
  let canMoveUp = $derived(parentIsArray && Number(field?.key) > 0)
  let canMoveDown = $derived(
    parentIsArray && Number(field?.key) < Number(field?.parent?.children?.length) - 1
  )
</script>

<ul
  style="box-shadow: 0px 8px 30px 0px rgba(10, 10, 10, 0.12)"
  class="flex space-x-2 rounded-md border border-neutral-200 py-1 px-[5px] bg-white"
>
  {#if showAdd}
    <li>
      <FieldButton icon={Plus} tooltipText={addLabel} onClick={() => onAdd?.()} />
    </li>
  {/if}
  {#if canDuplicate}
    <li>
      <FieldButton
        icon={DocumentDuplicate}
        tooltipText="Duplicate"
        onClick={() => onDuplicate?.()}
      />
    </li>
  {/if}
  {#if canMoveUp}
    <li>
      <FieldButton icon={ArrowUp} tooltipText="Move Up" onClick={() => onMoveUp?.()} />
    </li>
  {/if}
  {#if canMoveDown}
    <li>
      <FieldButton icon={ArrowDown} tooltipText="Move Down" onClick={() => onMoveDown?.()} />
    </li>
  {/if}
  {#if field?.is.disposable}
    <li>
      <FieldButton
        icon={Trash}
        confirmationIcon={Trash}
        tooltipText="Remove"
        isDestructive={true}
        onClick={() => onDelete?.()}
      />
    </li>
  {/if}
  <li>
    <FieldButton icon={Options} disabled />
  </li>
</ul>
