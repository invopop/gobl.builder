<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import { createEventDispatcher } from "svelte";

  export let field: UIModelField<string>;
  export let showError = false;

  const dispatch = createEventDispatcher();

  function handleChange(e: Event & { currentTarget: HTMLInputElement }) {
    const value = e.currentTarget.value;
    dispatch("edit", value);
  }
</script>

<input
  type="date"
  id={field.id}
  value={field.value}
  on:change={handleChange}
  on:keyup={handleChange}
  on:blur
  class="outline-none w-full border rounded h-8 py-1.5 px-2 text-gray-700 focus:border-gray-400"
  class:border-rose-500={showError}
  class:bg-slate-50={field.is.calculated}
  class:border-slate-100={field.is.calculated}
  class:focus:border-rose-500={showError}
/>
