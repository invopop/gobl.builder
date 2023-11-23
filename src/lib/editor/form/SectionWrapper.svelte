<script lang="ts">
  import type { UIModelField } from "./utils/model";
  import { envelopeIsSigned } from "../stores";
  import FieldTitle from "./FieldTitle.svelte";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";
  import clsx from "clsx";

  export let field: UIModelField;
  export let highlight = false;

  let open = true;

  $: label = $envelopeIsSigned
    ? "Document is signed and can not be edited"
    : `${field.schema.description || ""}${field.is.calculated ? " (calculated)" : ""}`;
  $: isSection = field.is.root || field.parent?.is.root;

  $: classes = clsx({
    "border-accent-500": highlight,
    "border-neutral-200": !highlight,
  });

  function handleFocusInner() {
    open = true;
  }
</script>

<div id={field.id} title={label}>
  <button
    class="flex items-center justify-start cursor-pointer h-8"
    on:click={() => {
      open = !open;
    }}
  >
    <FieldTitle {field} {isSection} />
    <ExpandButton {open} />
  </button>
  <div class="flex max-h-0" class:max-h-max={open} class:overflow-hidden={!open} on:focusin|capture={handleFocusInner}>
    <div class="{classes} w-2 border-l border-t border-b flex-none"></div>
    <div class="grid grid-cols-2 gap-2 w-full py-2">
      <slot />
    </div>
  </div>
  <slot name="extra-content" />
</div>
