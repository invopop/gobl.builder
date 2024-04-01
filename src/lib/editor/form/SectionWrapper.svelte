<script lang="ts">
  import { intersect } from "svelte-intersection-observer-action";
  import type { UIModelField } from "./utils/model";
  import FieldTitle from "./FieldTitle.svelte";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";
  import { slide } from "svelte/transition";
  import clsx from "clsx";
  import { getContext } from "svelte";
  import { getBuilderContext } from "$lib/store/builder";

  const { envelopeIsSigned } = getBuilderContext();

  const editorId = getContext("editorId");

  const { activeSection, activeItem, scrollingSection } = getBuilderContext();

  function callback(entry: IntersectionObserverEntry) {
    // If we are navigating from outside
    if ($scrollingSection) return;

    // We only care about intersecting in and off ocurring on the top side
    if (entry.boundingClientRect.top > 300) return;

    $activeSection = {
      section: field.id,
      scroll: false,
    };
  }
  const intersectOptions = { callback, root: document.querySelector(`#${editorId}`) };

  export let field: UIModelField;

  let element: HTMLElement;
  let open = true;

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
    $scrollingSection = true;

    setTimeout(() => {
      $scrollingSection = false;
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

<div bind:this={element} id={field.id} title={label} class="{wrapperClasses} border-t border-b border-r">
  {#if isSection}
    <div use:intersect={intersectOptions}></div>
  {/if}
  <div class="py-2 pl-3 pr-2">
    <button
      class="flex items-center justify-start cursor-pointer"
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
  {#if isSection}
    <div use:intersect={intersectOptions}></div>
  {/if}
</div>
<slot name="extra-content" />
