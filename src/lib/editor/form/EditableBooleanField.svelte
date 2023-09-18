<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let field: UIModelField;
  export let value = "";
  $: val = value || field.value;

  function handleChange(e: Event & { currentTarget: HTMLInputElement }) {
    const value = e.currentTarget.checked;
    dispatch("edit", value);
  }
</script>

<div class="flex items-center justify-center h-full">
  <input
    id={field.id}
    on:change={handleChange}
    type="checkbox"
    checked={val === true}
    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
  />
</div>
