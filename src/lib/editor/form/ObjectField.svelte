<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/schema.js";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";
  import AbstractField from "./AbstractField.svelte";
  import AddFieldMenu from "./AddFieldMenu.svelte";

  export let field: UIModelField;
  export let showAddMenu: string;
  let addMenuRef: HTMLElement;

  $: childs = Object.entries(field.children || {});

  let open = true;
  function handleOpenChange() {
    open = !open;
  }

  $: {
    if (showAddMenu && addMenuRef) {
      addMenuRef.scrollIntoView({ behavior: "auto", block: "center" });
      addMenuRef.focus();
    }
  }
</script>

<div class="flex items-center justify-start cursor-pointer" on:click={handleOpenChange}>
  <span class="text-black font-bold capitalize mr-1">{field.name}</span>
  <ExpandButton {open} />
</div>
<div class="pl-2 border-l max-h-0" class:max-h-max={open} class:overflow-hidden={!open}>
  {#each childs as [k, field] (k)}
    <AbstractField {field} />
  {/each}
  {#if showAddMenu || !childs.length}
    <AddFieldMenu {field} bind:inputRef={addMenuRef} on:closeAddFieldMenu />
  {/if}
</div>
