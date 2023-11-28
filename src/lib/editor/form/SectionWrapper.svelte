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
  $: classes = clsx({
    "border-neutral-100 bg-neutral-50": isActive,
    "border-transparent": !isActive,
  });

  function handleFocusInner() {
    open = true;
  }
</script>

<div id={field.id} title={label}>
  <div
    class:pl-2={isParent}
    class="{classes} py-1 pr-2 rounded-l border-l border-t border-b"
    class:ml-2={field.is.root}
  >
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
    <div
      transition:slide
      class:ml-4={field.is.root}
      class:overflow-hidden={!open}
      on:focusin|capture={handleFocusInner}
    >
      <div class="grid grid-cols-1 w-full py-1">
        <slot />
      </div>
    </div>
  {/if}
  <slot name="extra-content" />
</div>
