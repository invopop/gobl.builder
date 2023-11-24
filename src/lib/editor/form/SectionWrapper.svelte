<script lang="ts">
  import type { UIModelField } from "./utils/model";
  import { envelopeIsSigned } from "../stores";
  import FieldTitle from "./FieldTitle.svelte";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";
  import { slide } from "svelte/transition";

  export let field: UIModelField;

  let open = true;

  $: label = $envelopeIsSigned
    ? "Document is signed and can not be edited"
    : `${field.schema.description || ""}${field.is.calculated ? " (calculated)" : ""}`;
  $: isSection = field.is.root || field.parent?.is.root;

  function handleFocusInner() {
    open = true;
  }
</script>

<div id={field.id} title={label} class:pl-4={isSection} class:pl-2={!isSection}>
  <div class="pt-2.5 pb-2 pr-2.5" class:ml-4={field.is.root}>
    <button
      class="flex items-center justify-start cursor-pointer h-8"
      on:click={() => {
        open = !open;
      }}
    >
      <FieldTitle {field} {isSection} />
      <ExpandButton {open} />
    </button>
  </div>

  {#if open}
    <div
      transition:slide
      class:ml-4={field.is.root}
      class:overflow-hidden={!open}
      on:focusin|capture={handleFocusInner}
    >
      <div class="grid grid-cols-1 space-y-1 w-full py-1">
        <slot />
      </div>
    </div>
  {/if}
  <slot name="extra-content" />
</div>
