<script lang="ts">
  import type { EditableSelectFieldProps } from '$lib/types/editor'
  import clsx from 'clsx'

  let {
    field,
    options,
    showError = false,
    onEdit,
    onBlur,
    onfocus
  }: EditableSelectFieldProps = $props()

  let classes = $derived(
    clsx({
      'bg-background-default-secondary border-border-border-default-secondary text-foreground-default-secondary':
        field.is.calculated,
      'text-foreground bg-background': !field.is.calculated && !showError,
      'border-border-critical-bold text-foreground-critical': showError,
      'border-border-default-secondary': !showError
    })
  )

  function handleChange(e: Event & { currentTarget: HTMLSelectElement }) {
    const value = e.currentTarget.value

    onEdit?.(value)
  }

  function handleBlur(e: Event & { currentTarget: HTMLSelectElement }) {
    const value = e.currentTarget.value
    onBlur?.(value)
  }
</script>

<select
  id={field.id}
  value={field.value}
  onchange={handleChange}
  onkeyup={handleChange}
  onblur={handleBlur}
  {onfocus}
  class="{classes} border focus:border-border-selected-bold custom-select text-base text-ellipsis outline-none w-full rounded-lg h-[32px] pl-3 pr-8 appearance-none cursor-pointer disabled:cursor-default tracking-tight focus:shadow-active py-1.5 ring-0"
>
  {#each options as opt (opt.value)}
    <option value={opt.value} selected={field.value === opt.value}>{opt.label || opt.value}</option>
  {/each}
</select>

<style lang="postcss">
  .custom-select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iNCIgZmlsbD0iI0YzRjRGNiIvPgo8cGF0aCBkPSJNNi41IDguMjUwMDRMMTAgMTEuNzVMMTMuNSA4LjI1IiBzdHJva2U9IiMwMzA3MTIiIHN0cm9rZS13aWR0aD0iMS4xIi8+Cjwvc3ZnPg==');
    background-repeat: no-repeat;
    background-position: center right 6px;
  }

  /* Remove default arrow IE*/
  .custom-select::-ms-expand {
    display: none;
  }
</style>
