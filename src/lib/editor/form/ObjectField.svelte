<script lang="ts">
  import type { UIModelField } from "$lib/schema.js";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";
  import AbstractField from "./AbstractField.svelte";

  export let field: UIModelField;
  $: childs = Object.entries(field.children || {});

  let open = true;
  function handleOpenChange() {
    open = !open;
  }
</script>

<div class="hover:bg-gray-100" class:p-4={field.level === 0}>
  <div
    class="flex items-center justify-start hover:bg-gray-200 text-gray-300 hover:text-gray-500 cursor-pointer"
    on:click={handleOpenChange}
  >
    <span class="text-black font-bold capitalize">{field.title}</span>
    {#if childs.length > 0}<ExpandButton {open} />{/if}
  </div>
  <!-- {#if open} -->
  <div class="pl-2 border-l overflow-hidden max-h-0" class:max-h-max={open}>
    {#each childs as [k, field] (k)}
      <AbstractField {field} />
    {/each}
  </div>
  <!-- {/if} -->
</div>
