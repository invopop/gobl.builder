<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import { createEventDispatcher } from "svelte";

  export let field: UIModelField<string>;
  export let showError = false;
  export let classes = "";
  export let value = "";
  export let id = "";

  $: iid = id || field.id;
  $: val = value || field.value;

  const dispatch = createEventDispatcher();

  function handleChange(e: Event & { currentTarget: HTMLInputElement }) {
    const value = e.currentTarget.value;
    dispatch("edit", value);
  }

  function handleBlur(e: Event & { currentTarget: HTMLInputElement }) {
    const value = e.currentTarget.value;
    dispatch("blur", value);
  }
</script>

<input
  type="text"
  id={iid}
  value={val}
  on:change={handleChange}
  on:keyup={handleChange}
  on:blur={handleBlur}
  class="focus:border-gray-400 {classes}"
  class:bg-slate-50={field.is.calculated}
  class:border-slate-100={field.is.calculated}
  class:border-rose-500={showError}
  class:focus:border-rose-500={showError}
  class:text-right={field.schema.type === "number"}
/>

<style lang="postcss">
  input {
    @apply outline-none w-full rounded border h-8 py-1.5 px-2 text-gray-700;
  }
</style>
