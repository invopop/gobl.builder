<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import clsx from "clsx";
  import { createEventDispatcher } from "svelte";

  export let field: UIModelField<string>;
  export let options: { key: string; value: string | boolean }[];
  export let showError = false;

  $: classes = clsx({
    "bg-neutral-50 border-slate-100 text-neutral-500": field.is.calculated,
    "text-neutral-800": !field.is.calculated && !showError,
    "border-danger-200 focus:border-danger-200 text-danger-500": showError,
  });

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
  on:change={handleChange}
  on:keyup={handleChange}
  on:blur={handleBlur}
  class="{classes} border focus:border-accent-500 custom-select text-base text-ellipsis outline-none w-full rounded h-[32px] pl-3 pr-8 appearance-none cursor-pointer disabled:cursor-default tracking-tight"
>
  {#each options as opt (opt.value)}
    <option value={opt.value} selected={field.value === opt.value}>{opt.key || opt.value}</option>
  {/each}
</select>

<style lang="postcss">
  .custom-select {
    /* icon */
    background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iOCIgZmlsbD0iI0YzRjVGNSIvPgo8cGF0aCBkPSJNNi41IDguMjUwMDRMMTAgMTEuNzVMMTMuNSA4LjI1IiBzdHJva2U9IiMwQTBBMEEiIHN0cm9rZS13aWR0aD0iMS4yIi8+Cjwvc3ZnPgo=") !important;
    background-repeat: no-repeat !important;
    background-position: center right -1.3rem !important;
    background-origin: content-box !important;
    background-size: 20px !important;
  }

  /* Remove default arrow IE*/
  .custom-select::-ms-expand {
    display: none;
  }
</style>
