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
  import { envelopeIsSigned } from "../stores";
  import clsx from "clsx";

  const dispatch = createEventDispatcher();

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
  let isHover = false;
  let isFocus = false;
  let contextMenuOffset = 0;
  let highlight = false;

  export let readOnly = false;

  $: showContextMenu = !$envelopeIsSigned && (isHover || isFocus);
  $: if (showAddMenu && addMenuRef) {
    const { height, top } = addMenuRef.getBoundingClientRect();
    const offset = top + height - window.innerHeight;
    contextMenuOffset = offset > 0 ? offset : 0;
  }
  $: isParent = ["object", "array"].includes(field.type);
  $: isSection = isParent && field.parent?.is.root;
  $: wrapperClasses = clsx({
    "bg-neutral-50 border-neutral-100": showContextMenu && !isParent,
    "border-transparent": !showContextMenu,
    border: !isParent,
  });
  $: classes = clsx({
    "border-accent-500": highlight,
    "border-neutral-200": !highlight,
  });

  function handleHoverChild(e: CustomEvent) {
    highlight = e.detail;
    dispatch("hoverChild", e.detail);
  }

  function handleHover(e: CustomEvent<boolean>) {
    // @note: Prevent undesired hover events on other items while dragging
    isHover = e.detail;

    if (!isHover && isFocus) return; // avoid parent to remove the highlight for the section when element is focused

    dispatch("hoverChild", e.detail);
  }

  function handleFocusIn(e: FocusEvent) {
    // @note: Prevent undesired hover events on other items while dragging
    isFocus = true;
    e.stopPropagation();
    dispatch("hoverChild", true);
  }

  function handleFocusOut(e: FocusEvent) {
    // // @note: Prevent undesired hover events on other items while dragging
    isFocus = false;
    e.stopPropagation();
    dispatch("hoverChild", false);
  }

  function handleAddField() {
    showAddMenu = false;

    // @note: Add field directly instead of showing the dropdown option list
    if (field.type === "array" || field.controlType === "dictionary") {
      const [childOption] = field.options || [];

      const newField = field.addChildField(childOption);
      newField?.tryFocus();
      dispatch("fieldAdded", newField);

      return;
    }

    showAddMenu = true;
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
  <hr class="my-6 border-dashed" />
{/if}

<div
  role="button"
  tabindex="0"
  class:col-span-2={["object", "array"].includes(field.type)}
  class="relative rounded expanded-area cursor-default"
  use:hover
  on:hover={handleHover}
  on:keydown={handleKeyDown}
  on:focusin={handleFocusIn}
  on:focusout={handleFocusOut}
>
  <div class="{wrapperClasses} rounded flex" class:mb-2={isParent}>
    {#if isParent && !isSection && !field.is.root}
      <div class="{classes} w-2 border-l border-t border-b flex-none"></div>
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
        on:hoverChild={handleHoverChild}
      />
    </div>
  </div>
  <div on:hover={handleHover} class="absolute top-0 -right-8 h-6" class:bg-neutral-50={showContextMenu && !isParent}>
    <span class:invisible={($envelopeIsSigned || !field.is.root) && !showContextMenu}>
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
        class="absolute top-10 right-0 w-64 z-20"
        style={`margin-top: -${contextMenuOffset}px`}
        bind:this={addMenuRef}
      >
        <AddFieldMenu on:fieldAdded {field} on:closeAddFieldMenu={() => (showAddMenu = false)} />
      </div>
    {/if}
  </div>
</div>
