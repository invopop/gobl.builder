<script lang="ts">
  import { toasts } from 'svelte-toasts'
  import clsx from 'clsx'
  import type { ReadOnlyFieldProps } from '$lib/types/editor'

  let { field }: ReadOnlyFieldProps = $props()

  function getValue(value: string): string {
    if (field.controlType === 'select') {
      const option = field.controlMeta.find(
        (o: { label: string; value: string }) => o.value === value
      )
      return option ? option.label : ''
    }

    if (field.controlType === 'date') {
      const dateObject = new Date(value)

      return dateObject.toISOString().split('T')[0]
    }

    return value
  }

  async function handleClick() {
    await navigator.clipboard.writeText(value)
    toasts.add({
      type: 'success',
      description: 'Copied to clipboard'
    })
  }
  let fieldType = $derived(
    Array.isArray(field.schema.type) ? field.schema.type[0] : field.schema.type || ''
  )
  let classes = $derived(
    clsx({
      'text-right tabular-nums slashed-zero': ['number', 'integer'].includes(fieldType),
      'text-left': !['number', 'integer'].includes(fieldType)
    })
  )
  let value = $derived(getValue(field.value as string))
</script>

<button
  id={`${field.id}-readOnly`}
  onclick={handleClick}
  class="{classes} text-neutral-800 text-base px-3 outline-none w-full tracking-normal break-words border-l border-transparent"
>
  {value}
</button>
