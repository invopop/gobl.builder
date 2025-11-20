<script lang="ts">
  import clsx from 'clsx'
  import type { ReadOnlyFieldProps } from '$lib/types/editor'
  import { getBuilderContext } from '$lib/store/builder'

  const { notify } = getBuilderContext()

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
    notify({ message: 'Copied to clipboard', type: 'success' })
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
  class="{classes} text-foreground text-base px-3 outline-none w-full tracking-normal break-words border-l border-transparent"
>
  {value}
</button>
