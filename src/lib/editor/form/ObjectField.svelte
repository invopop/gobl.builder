<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";
  import AbstractField from "./AbstractField.svelte";
  import FieldTitle from "./FieldTitle.svelte";
  import RootField from "./RootField.svelte";

  export let field: UIModelField;
  let open = true; // field.level >= 2;
  $: children = field.children || ([] as UIModelField[]);

  function handleExpandChange() {
    open = !open;
  }

  function handleFocusInner() {
    console.log("-> ", field.id);
    open = true;
  }

  $: props = $$props as any;
</script>

{#if field.is.root}
  <RootField {...props} />
{:else}
  <div id={field.id}>
    <button class="flex items-center justify-start cursor-pointer h-8" on:click={handleExpandChange}>
      <FieldTitle {field} />
      <ExpandButton {open} />
    </button>
    <div
      class="pl-6 border-l max-h-0"
      class:max-h-max={open}
      class:overflow-hidden={!open}
      on:focusin|capture={handleFocusInner}
    >
      {#each children as childField (childField.id)}
        <AbstractField field={childField} />
      {/each}
    </div>
    <slot />
  </div>
{/if}
