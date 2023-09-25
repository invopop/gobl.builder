<script lang="ts">
  import type { UIModelField, UIModelRootField } from "$lib/editor/form/utils/model.js";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";
  import { envelopeIsSigned } from "../stores";
  import AbstractField from "./AbstractField.svelte";
  import FieldTitle from "./FieldTitle.svelte";
  import RootField from "./RootField.svelte";

  export let field: UIModelField;
  export let readOnly = false;

  let open = true; // field.level >= 2;
  $: children = field.children || ([] as UIModelField[]);
  $: label = $envelopeIsSigned
    ? "Document is signed and can not be edited"
    : `${field.schema.description || ""}${field.is.calculated ? " (calculated)" : ""}`;

  function handleExpandChange() {
    open = !open;
  }

  function handleFocusInner() {
    console.log("-> ", field.id);
    open = true;
  }

  interface PropsInterface {
    field: UIModelRootField;
  }

  $: props = $$props as PropsInterface;
</script>

{#if field.is.root}
  <RootField
    {...props}
    {readOnly}
    on:fieldAdded
    on:fieldDeleted
    on:fieldDuplicated
    on:fieldMoved
    on:fieldValueUpdated
    on:fieldKeyUpdated
  />
{:else}
  <div id={field.id} title={label}>
    <button class="flex items-center justify-start cursor-pointer h-8" on:click={handleExpandChange}>
      <FieldTitle {field} />
      <ExpandButton {open} />
    </button>
    <div
      class="pl-4 border-l max-h-0"
      class:max-h-max={open}
      class:overflow-hidden={!open}
      on:focusin|capture={handleFocusInner}
    >
      {#each children as childField (childField.id)}
        <AbstractField
          field={childField}
          {readOnly}
          on:fieldAdded
          on:fieldDeleted
          on:fieldDuplicated
          on:fieldMoved
          on:fieldValueUpdated
          on:fieldKeyUpdated
        />
      {/each}
    </div>
    <slot />
  </div>
{/if}
