<script lang="ts">
  import { DateInput } from 'date-picker-svelte'
  import clsx from 'clsx'
  import { onDestroy, onMount, tick } from 'svelte'
  import { Icon } from 'svelte-hero-icons'
  import { Calendar } from '@invopop/ui-icons'
  import type { EditableDateFieldProps } from '$lib/types/editor'

  const uniqueId = `date-input-${Math.random().toString(36).slice(2, 7)}`

  let { field, showError = false, onBlur, onEdit }: EditableDateFieldProps = $props()

  let input: HTMLInputElement | undefined

  let classes = $derived(
    clsx({
      [uniqueId]: true,
      'is-calculated': field.is.calculated,
      'has-error': showError
    })
  )

  let date = $derived(new Date(field.value))

  async function hanldeSelect() {
    await tick()

    if (!input) return

    const value = input.value

    if (value == field.value) return

    onBlur?.(value)
    onEdit?.(value)
  }

  onMount(() => {
    input = document.querySelector(`.${uniqueId} > input`) as HTMLInputElement

    if (!input) return

    input.addEventListener('blur', hanldeSelect)
  })

  onDestroy(() => {
    if (!input) return

    input.removeEventListener('blur', hanldeSelect)
  })
</script>

<div class="relative">
  <!-- TODO: update event to a callback when component is ready for svelte 5 -->
  <DateInput
    id={field.id}
    class={classes}
    value={date}
    closeOnSelection
    format="yyyy-MM-dd"
    placeholder="YYYY-MM-DD"
    on:select={hanldeSelect}
  />
  <Icon src={Calendar} class="w-4 h-4 text-neutral-500 absolute left-2 top-2" />
</div>

<style>
  :global(.date-time-field > input) {
    height: 32px;
    width: 100% !important;
    border: 1px solid #e9ebeb !important;
    border-radius: 4px !important;
    padding: 5px 28px !important;
    color: #0a0a0a !important;
    font-family: Inter;
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: 21.75px;
    letter-spacing: -0.135px;
    background-color: white !important;
  }

  :global(.date-time-field.is-calculated > input) {
    background-color: #fafbfb !important;
    color: #7e7f7f !important;
  }
  :global(.date-time-field > input:focus) {
    border: 1px solid #169958 !important;
    box-shadow: 0px 0px 0px 2px rgba(22, 153, 88, 0.12) !important;
  }
  :global(.date-time-field > input.invalid:focus, .date-time-field.has-error > input) {
    color: #ec4e46 !important;
    border: 1px solid #ec4e4666 !important;
  }
</style>
