<script lang="ts">
  import type { UIModelField, UIModelRootField } from "$lib/editor/form/utils/model.js";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";
  import { createEventDispatcher } from "svelte";
  import { envelopeIsSigned } from "../stores";
  import AbstractField from "./AbstractField.svelte";
  import FieldTitle from "./FieldTitle.svelte";
  import RootField from "./RootField.svelte";

  const dispatch = createEventDispatcher();

  export let field: UIModelField;
  export let readOnly = false;

  let open = true; // field.level >= 2;
  let childIsHovered = false;

  $: children = field.children || ([] as UIModelField[]);
  $: label = $envelopeIsSigned
    ? "Document is signed and can not be edited"
    : `${field.schema.description || ""}${field.is.calculated ? " (calculated)" : ""}`;

  $: isSection = field.is.root || field.parent?.is.root;

  function handleExpandChange() {
    open = !open;
  }

  function handleFocusInner() {
    console.log("-> ", field.id);
    open = true;
  }

  function handleHoverChild(e: CustomEvent) {
    childIsHovered = e.detail;
    dispatch("hoverChild", e.detail);
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
      <FieldTitle {field} {isSection} />
      <ExpandButton {open} />
    </button>
    <div
      class="flex max-h-0"
      class:max-h-max={open}
      class:overflow-hidden={!open}
      on:focusin|capture={handleFocusInner}
    >
      <div
        class:border-accent-500={childIsHovered}
        class="w-2 border-l border-t border-b flex-none border-neutral-200"
      ></div>
      <div class="grid grid-cols-2 gap-2 w-full py-2">
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
            on:hoverChild={handleHoverChild}
          />
        {/each}
      </div>
    </div>
    <slot />
  </div>
{/if}
