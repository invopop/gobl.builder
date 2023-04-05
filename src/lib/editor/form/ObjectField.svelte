<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";
  import AbstractField from "./AbstractField.svelte";
  import AddFieldMenu from "./AddFieldMenu.svelte";
  import FieldTitle from "./FieldTitle.svelte";

  export let field: UIModelField;
  export let showAddMenu: string;
  let addMenuRef: HTMLElement;

  $: childs = field.children || ([] as UIModelField[]);

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
  <FieldTitle>{field.schema.title || field.key}</FieldTitle>
  <ExpandButton {open} />
</div>
<div class="pl-2 border-l max-h-0" class:max-h-max={open} class:overflow-hidden={!open}>
  {#each childs as field (field.key)}
    <AbstractField {field} />
  {/each}
  {#if showAddMenu || !childs.length}
    <AddFieldMenu {field} bind:inputRef={addMenuRef} on:closeAddFieldMenu />
  {/if}
</div>
