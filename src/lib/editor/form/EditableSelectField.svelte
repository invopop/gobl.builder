<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import { createEventDispatcher } from "svelte";

  export let field: UIModelField<string>;
  export let options: { key: string; value: string }[];
  export let showError = false;

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
  class="text-ellipsis outline-none w-full rounded border h-8 py-1.5 pl-2 pr-8 text-gray-700 appearance-none focus:border-gray-400 cursor-pointer"
  class:border-rose-500={showError}
  class:bg-slate-50={field.is.calculated}
  class:border-slate-100={field.is.calculated}
  class:focus:border-rose-500={showError}
>
  {#each options as opt (opt.value)}
    <option value={opt.value} selected={field.value === opt.value}>{opt.key || opt.value}</option>
  {/each}
</select>

<style lang="postcss">
  select {
    /* icon */
    background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxNiAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aAogICAgZD0iTTggOS40Mzc1TDguNjg3NSA4LjcxODc1TDE0LjY4NzUgMi43MTg3NUwxNS40MDYyIDJMMTQgMC41OTM3NUwxMy4yODEyIDEuMzEyNUw4IDYuNTkzNzVMMi42ODc1IDEuMzEyNUwyIDAuNTkzNzVMMC41NjI1IDJMMS4yODEyNSAyLjcxODc1TDcuMjgxMjUgOC43MTg3NUw4IDkuNDM3NVoiCiAgICBmaWxsPSJibGFjayIgLz4KPC9zdmc+");
    background-repeat: no-repeat;
    background-position: center right -1.3rem;
    background-origin: content-box;
    background-size: 0.8em;
  }

  /* Remove default arrow IE*/
  select::-ms-expand {
    display: none;
  }
</style>
