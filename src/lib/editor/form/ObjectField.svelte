<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";
  import AbstractField from "./AbstractField.svelte";
  import FieldTitle from "./FieldTitle.svelte";

  export let field: UIModelField;
  let open = field.level >= 2;
  $: childs = field.children || ([] as UIModelField[]);

  function handleExpandChange() {
    open = !open;
  }

  function handleFocusInner() {
    console.log("-> ", field.id);
    open = true;
  }
</script>

<div class="flex items-center justify-start cursor-pointer h-8" on:click={handleExpandChange}>
  <FieldTitle {field} />
  <ExpandButton {open} />
</div>
<div
  class="pl-2 border-l max-h-0"
  class:max-h-max={open}
  class:overflow-hidden={!open}
  on:focusin|capture={handleFocusInner}
>
  {#each childs as childField (childField.key)}
    <AbstractField field={childField} />
  {/each}
</div>
