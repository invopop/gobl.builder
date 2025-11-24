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

  $inspect(field.value)
  $inspect(date)
  async function handleSelect() {
    await tick()

    if (!input) return

    const value = input.value

    console.log(value)

    if (value == field.value) return

    onBlur?.(value)
    onEdit?.(value)
  }

  onMount(() => {
    input = document.querySelector(`.${uniqueId} > input`) as HTMLInputElement

    if (!input) return

    input.addEventListener('blur', handleSelect)
  })

  onDestroy(() => {
    if (!input) return

    input.removeEventListener('blur', handleSelect)
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
    max={new Date(2050, 11, 31)}
    on:select={handleSelect}
  />
  <Icon src={Calendar} class="w-4 h-4 text-icon absolute left-2 top-2" />
</div>

<style>
  :global(.date-time-field > input) {
    height: 32px;
    width: 100% !important;
    border: 1px solid var(--color-border-default-secondary) !important;
    border-radius: 8px !important;
    padding: 5px 28px !important;
    color: var(--color-foreground) !important;
    font-family: Inter;
    font-size: var(--text-base);
    font-style: normal;
    font-weight: 400;
    line-height: 21.75px;
    letter-spacing: -0.135px;
    background-color: var(--color-background) !important;
  }

  :global(.date-time-field.is-calculated > input) {
    background-color: var(--color-background-default-secondary) !important;
    color: var(--color-foreground-default-secondary) !important;
  }
  :global(.date-time-field > input:focus) {
    border: 1px solid var(--color-border-selected-bold) !important;
    box-shadow: var(--shadow-active) !important;
  }
  :global(.date-time-field > input.invalid:focus, .date-time-field.has-error > input) {
    color: var(--color-foreground-critical) !important;
    border: 1px solid var(--color-border-critical-bold) !important;
  }
</style>
