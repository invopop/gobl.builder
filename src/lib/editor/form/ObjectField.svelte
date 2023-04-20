<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";
  import AbstractField from "./AbstractField.svelte";
  import FieldTitle from "./FieldTitle.svelte";

  export let field: UIModelField;

  $: childs = field.children || ([] as UIModelField[]);

  let open = true;
  function handleOpenChange() {
    open = !open;
  }
</script>

<div class="flex items-center justify-start cursor-pointer h-8" on:click={handleOpenChange}>
  <FieldTitle {field} />
  <ExpandButton {open} />
</div>
<div class="pl-2 border-l max-h-0" class:max-h-max={open} class:overflow-hidden={!open}>
  {#each childs as childField (childField.key)}
    <AbstractField field={childField} />
  {/each}
</div>
