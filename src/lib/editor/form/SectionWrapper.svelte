<script lang="ts">
  import { intersect } from "svelte-intersection-observer-action";
  import type { UIModelField } from "./utils/model";
  import FieldTitle from "./FieldTitle.svelte";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";
  import { slide } from "svelte/transition";
  import clsx from "clsx";
  import { getContext } from "svelte";
  import { getBuilderContext } from "$lib/store/builder";
  import type { Schema } from "./utils/schema";

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
  export let readOnly = false;

  let element: HTMLElement;
  let open = true;

  $: childrenType = (field.schema.items as Schema)?.type;
  $: label = $envelopeIsSigned
    ? "Document is signed and can not be edited"
    : `${field.schema.description || ""}${field.is.calculated ? " (calculated)" : ""}`;
  $: isParent = ["object", "array"].includes(field.type) && childrenType !== "string";
  $: isSection = field.is.root || (isParent && field.parent?.is.root);
  $: wrapperClasses = clsx({
    "rounded-r": readOnly,
    "border-neutral-100 bg-neutral-50": isActive,
    "border-l rounded-l": isSection,
    "border-transparent": !isActive,
    "border-t border-b border-r": childrenType !== "string",
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

<div bind:this={element} id={field.id} title={label} class={wrapperClasses}>
  {#if isSection}
    <div use:intersect={intersectOptions}></div>
  {/if}
  {#if isParent}
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
  {/if}

  {#if open}
    <div transition:slide class:overflow-hidden={!open} on:focusin|capture={handleFocusInner}>
      <div class:pb-1={isParent} class="grid grid-cols-1 w-full">
        <slot />
      </div>
    </div>
  {/if}
  {#if isSection}
    <div use:intersect={intersectOptions}></div>
  {/if}
</div>
<slot name="extra-content" />
