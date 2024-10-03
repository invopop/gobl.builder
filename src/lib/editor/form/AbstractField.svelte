<script lang="ts">
  import { createEventDispatcher, type SvelteComponent } from "svelte";
  import ObjectField from "./ObjectField.svelte";
  import ArrayField from "./ArrayField.svelte";
  import StringField from "./StringField.svelte";
  import FallbackField from "./FallbackField.svelte";
  import FieldContextMenu from "./FieldContextMenu.svelte";
  import hover from "./action/hover.js";
  import IntegerField from "./IntegerField.svelte";
  import type { UIModelField } from "./utils/model.js";
  import AddFieldMenu from "./AddFieldMenu.svelte";
  import BooleanField from "./BooleanField.svelte";
  import clsx from "clsx";
  import { getBuilderContext } from "$lib/store/builder";
  import type { Schema } from "./utils/schema";

  const dispatch = createEventDispatcher();

  const { activeItem, highlightedItem } = getBuilderContext();

  export let field: UIModelField;

  const componentsMap: Record<string, typeof SvelteComponent> = {
    object: ObjectField as typeof SvelteComponent,
    array: ArrayField as typeof SvelteComponent,
    string: StringField as typeof SvelteComponent,
    number: StringField as typeof SvelteComponent,
    integer: IntegerField as typeof SvelteComponent,
    boolean: BooleanField as typeof SvelteComponent,
  };

  let showAddMenu = false;
  let addMenuRef: HTMLElement;
  let contextMenuOffset = 0;

  export let readOnly = false;

  $: childrenType = (field.schema.items as Schema)?.type;
  $: isHover = $activeItem === field.id;
  $: highlight = $highlightedItem === field.id;
  $: showContextMenu = !readOnly && isHover;
  $: if (showAddMenu && addMenuRef) {
    const { height, top } = addMenuRef.getBoundingClientRect();
    const offset = top + height - window.innerHeight;
    contextMenuOffset = offset > 0 ? offset : 0;
  }
  $: isParent = ["object", "array"].includes(field.type) && childrenType !== "string";
  $: isSection = isParent && field.parent?.is.root;
  $: wrapperClasses = clsx({
    "bg-neutral-50 border-neutral-100": isHover && !isParent,
    "border-transparent": !isHover,
    "border-l border-t border-b": !["object", "array"].includes(field.type),
    "border-r rounded-r": readOnly && !isParent,
    "pl-2": isParent && !isSection,
  });
  $: classes = clsx({
    "bg-neutral-50": isHover,
    "border-workspace-accent-500": highlight,
    "border-neutral-200": !highlight,
    "border-l border-t border-b": childrenType !== "string",
  });
  $: contextMenuClasses = clsx({
    "mt-1": isParent && !isSection && !field.is.root,
  });

  function handleHover(e: CustomEvent<boolean>) {
    $activeItem = e.detail ? field.id : null;

    if (!e.detail) return;

    $highlightedItem = isParent ? field.id : field.parent?.id || null;
  }

  function handleFocusIn(e: FocusEvent) {
    e.stopPropagation();

    $activeItem = field.id;
    $highlightedItem = isParent ? field.id : field.parent?.id || null;
  }

  function handleAddField() {
    showAddMenu = false;

    // Children of string arrays can add items directly from the row
    if (field.type === "string" && field.parent?.type === "array") {
      addFieldToArray(field.parent);
      return;
    }

    // @note: Add field directly instead of showing the dropdown option list
    if (field.type === "array" || field.controlType === "dictionary") {
      addFieldToArray(field);
      return;
    }

    showAddMenu = true;
  }

  function addFieldToArray(f: UIModelField) {
    const [childOption] = f.options || [];

    const newField = f.addChildField(childOption);
    newField?.tryFocus();
    dispatch("fieldAdded", newField);
  }

  function focusNextField(nextField = field.getNextFocusableField()) {
    if (!nextField) return;
    nextField.tryFocus(5, 0);
  }

  function focusPrevField(prevField = field.getPrevFocusableField()) {
    if (!prevField) return;
    prevField.tryFocus(5, 0);
  }

  function handleKeyDown(e: KeyboardEvent) {
    e.stopPropagation();

    const goPrev = e.key === "ArrowUp" || (e.shiftKey && e.key === "Tab");
    const goNext = e.key === "ArrowDown" || (!e.shiftKey && e.key === "Tab");
    const goAdd = e.key === "Enter";
    const blur = e.key === "Escape";

    if (blur) {
      (e.target as HTMLElement)?.blur();
    } else if (goAdd) {
      const nextItem = field.getNextFocusableField();

      // @note: Last item but the parent is not complete, show the add field menu
      if (nextItem?.isContainer() && !field.is.complete) {
        return handleAddField();
      } else {
        return focusNextField(nextItem);
      }
    } else if (goNext) {
      e.preventDefault();

      const elementId = (e.target as HTMLElement)?.id || "";
      const isKeyField = elementId.includes("-key");

      if (isKeyField) {
        return focusNextField(field);
      }

      return focusNextField();
    } else if (goPrev) {
      e.preventDefault();
      return focusPrevField();
    }
  }
</script>

<svelte:window />

{#if isSection}
  <div class="my-4 mx-2 border-b border-transparent hr-separator" />
{/if}

<div
  role="button"
  tabindex="0"
  class="relative rounded expanded-area cursor-default"
  use:hover
  on:hover={handleHover}
  on:keydown={handleKeyDown}
  on:focusin={handleFocusIn}
>
  <div class="{wrapperClasses} rounded-l flex" class:my-1={isParent}>
    {#if isParent && !isSection && !field.is.root}
      <div class="{classes} w-2 flex-none rounded-l"></div>
    {/if}
    <div class="flex-1">
      <svelte:component
        this={componentsMap[field.type] || FallbackField}
        {field}
        {readOnly}
        on:fieldAdded
        on:fieldDeleted
        on:fieldDuplicated
        on:fieldMoved
        on:fieldValueUpdated
        on:fieldKeyUpdated
      />
    </div>
  </div>
  {#if childrenType !== "string"}
    <div class="absolute top-0 right-0 w-9 h-10 -mr-9 bg-transparent">
      <span
        class="{contextMenuClasses} absolute top-0 left-0 -ml-px pt-[7px] pr-2 pb-[5.5px] bg-neutral-50 border-t border-b border-r border-neutral-100 rounded-r border-l-neutral-50 border-l"
        class:invisible={!showContextMenu}
      >
        <FieldContextMenu
          {field}
          on:addField={handleAddField}
          on:fieldDeleted
          on:fieldDuplicated
          on:fieldMoved
          on:fieldValueUpdated
          on:fieldKeyUpdated
        />
      </span>
      {#if showAddMenu}
        <div
          class="absolute top-12 -right-8 w-64 z-20"
          style={`margin-top: -${contextMenuOffset}px`}
          bind:this={addMenuRef}
        >
          <AddFieldMenu on:fieldAdded {field} on:closeAddFieldMenu={() => (showAddMenu = false)} />
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .hr-separator {
    border-image: repeating-linear-gradient(90deg, #cccece, #cccece 3px, transparent 3px, transparent 7px);
    border-image-slice: 1;
  }
</style>
