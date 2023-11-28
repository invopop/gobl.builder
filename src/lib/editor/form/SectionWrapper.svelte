<script lang="ts">
  import type { UIModelField } from "./utils/model";
  import { envelopeIsSigned } from "../stores";
  import FieldTitle from "./FieldTitle.svelte";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";
  import { slide } from "svelte/transition";
  import clsx from "clsx";

  export let field: UIModelField;
  export let isActive = false;

  let open = true;

  $: label = $envelopeIsSigned
    ? "Document is signed and can not be edited"
    : `${field.schema.description || ""}${field.is.calculated ? " (calculated)" : ""}`;
  $: isParent = ["object", "array"].includes(field.type);
  $: isSection = field.is.root || (isParent && field.parent?.is.root);
  $: wrapperClasses = clsx({
    "border-neutral-100 bg-neutral-50": isActive,
    "border-l": isSection,
    "border-transparent": !isActive,
  });

  function handleFocusInner() {
    open = true;
  }
</script>

<div id={field.id} title={label} class="{wrapperClasses} border-t border-b border-r">
  <div class:pl-2={isParent} class="mt-1 py-1 pr-2">
    <button
      class="flex items-center justify-start cursor-pointer h-8"
      on:click={() => {
        open = !open;
      }}
    >
      <FieldTitle {field} />
      <ExpandButton {open} />
    </button>
  </div>

  {#if open}
    <div transition:slide class:overflow-hidden={!open} on:focusin|capture={handleFocusInner}>
      <div class="grid grid-cols-1 w-full pb-1">
        <slot />
      </div>
    </div>
  {/if}
</div>
<slot name="extra-content" />
