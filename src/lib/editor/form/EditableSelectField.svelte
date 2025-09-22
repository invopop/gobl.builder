<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import clsx from "clsx";
  import { createEventDispatcher } from "svelte";

  interface Props {
    field: UIModelField<string>;
    options: { label: string; value: string | boolean }[];
    showError?: boolean;
  }

  let { field, options, showError = false }: Props = $props();

  let classes = $derived(clsx({
    "bg-neutral-50 border-slate-100 text-neutral-500": field.is.calculated,
    "text-neutral-800": !field.is.calculated && !showError,
    "border-danger-200 focus:border-danger-200 text-danger-500": showError,
  }));

  const dispatch = createEventDispatcher();

  function handleChange(e: Event & { currentTarget: HTMLSelectElement }) {
    const value = e.currentTarget.value;

    dispatch("edit", value);
  }

  function handleBlur(e: Event & { currentTarget: HTMLSelectElement }) {
    const value = e.currentTarget.value;
    dispatch("blur", value);
  }
</script>

<select
  id={field.id}
  value={field.value}
  onchange={handleChange}
  onkeyup={handleChange}
  onblur={handleBlur}
  onfocus={bubble('focus')}
  class="{classes} border focus:border-workspace-accent-500 custom-select text-base text-ellipsis outline-none w-full rounded h-[32px] pl-3 pr-8 appearance-none cursor-pointer disabled:cursor-default tracking-tight focus:shadow-active"
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
    background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iNCIgZmlsbD0iI0YzRjRGNiIvPgo8cGF0aCBkPSJNNi41IDguMjUwMDRMMTAgMTEuNzVMMTMuNSA4LjI1IiBzdHJva2U9IiMwMzA3MTIiIHN0cm9rZS13aWR0aD0iMS4xIi8+Cjwvc3ZnPg==");
    background-repeat: no-repeat;
    background-position: center right 6px;
  }

  /* Remove default arrow IE*/
  .custom-select::-ms-expand {
    display: none;
  }
</style>
