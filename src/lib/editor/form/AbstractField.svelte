<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/schema.js";
  import type { SvelteComponent } from "svelte";
  import ObjectField from "./ObjectField.svelte";
  import ArrayField from "./ArrayField.svelte";
  import StringField from "./StringField.svelte";
  import FallbackField from "./FallbackField.svelte";
  import FieldContextMenu from "./FieldContextMenu.svelte";
  import hover from "./action/hover.js";
  import IntegerField from "./IntegerField.svelte";

  export let field: UIModelField;

  const componentsMap: Record<string, typeof SvelteComponent> = {
    object: ObjectField,
    array: ArrayField,
    string: StringField,
    integer: IntegerField,
  };

  let showContextMenu = false;
  let showAddMenu = false;

  function handleHover(e: CustomEvent<boolean>) {
    showContextMenu = e.detail;
  }

  function handleAddField() {
    showAddMenu = true;
  }

  function handleAddFieldMenuClose() {
    showAddMenu = false;
  }
</script>

<div class="p-2 relative" use:hover on:hover={handleHover}>
  {#if showContextMenu}
    <FieldContextMenu {field} on:addField={handleAddField} />
  {/if}
  <div class="relative">
    <svelte:component
      this={componentsMap[field.type] || FallbackField}
      {field}
      {showAddMenu}
      on:closeAddFieldMenu={handleAddFieldMenuClose}
    />
  </div>
</div>
