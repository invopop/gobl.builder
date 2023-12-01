<script lang="ts">
  import { intersect } from "svelte-intersection-observer-action";
  import type { UIModelField } from "./utils/model";
  import { envelopeIsSigned } from "../stores";
  import FieldTitle from "./FieldTitle.svelte";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";
  import { slide } from "svelte/transition";
  import clsx from "clsx";
  import { activeItem, activeSection } from "$lib/store/visualEditor";

  function callback(entry: IntersectionObserverEntry) {
    // If we are navigating from outside
    if (disableIntersect) return;

    // We only care about intersecting in and off ocurring on the top side
    if (entry.boundingClientRect.top > 100) return;

    $activeSection = {
      section: field.id,
      scroll: false,
    };
  }
  const intersectOptions = { callback, root: document.querySelector("#visual-editor") };

  export let field: UIModelField;

  let element: HTMLElement;
  let open = true;
  let disableIntersect = false;

  $: label = $envelopeIsSigned
    ? "Document is signed and can not be edited"
    : `${field.schema.description || ""}${field.is.calculated ? " (calculated)" : ""}`;
  $: isParent = ["object", "array"].includes(field.type);
  $: isSection = field.is.root || (isParent && field.parent?.is.root);
  $: wrapperClasses = clsx({
    "border-neutral-100 bg-neutral-50": isActive,
    "border-l rounded-l": isSection,
    "border-transparent": !isActive,
  });
  $: isActive = field.id === $activeItem;

  $: if ($activeSection.scroll) {
    scrollElementIntoView();
  }

  function scrollElementIntoView() {
    disableIntersect = true;

    setTimeout(() => {
      disableIntersect = false;
    }, 1000);

    if (!element || $activeSection.section !== field.id) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleFocusInner() {
    open = true;
  }
</script>

<div bind:this={element} id={field.id} title={label} class="{wrapperClasses} border-t border-b border-r rounded-r">
  {#if isSection}
    <div use:intersect={intersectOptions}></div>
  {/if}
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
