<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import ObjectField from "./ObjectField.svelte";
  import ArrayField from "./ArrayField.svelte";
  import StringField from "./StringField.svelte";
  import FallbackField from "./FallbackField.svelte";
  import FieldContextMenu from "./FieldContextMenu.svelte";
  import hover from "./action/hover.js";
  import IntegerField from "./IntegerField.svelte";
  import { getFormEditorContext } from "./context/formEditor.js";
  import type { UIModelField } from "./utils/model.js";
  import AddFieldMenu from "./AddFieldMenu.svelte";

  export let field: UIModelField;

  const componentsMap: Record<string, typeof SvelteComponent> = {
    object: ObjectField as typeof SvelteComponent,
    array: ArrayField,
    string: StringField,
    integer: IntegerField,
  };

  let showAddMenu = false;
  let addMenuRef: HTMLElement;
  let isHover = false;
  let isFocus = false;

  $: showContextMenu = !field.is.root && (isHover || isFocus);
  $: parentField = field.parent as UIModelField;
  $: addMenuEmptyItem = field.is.empty;
  $: addMenu = !addMenuEmptyItem && showAddMenu && !parentField.is.complete;

  $: {
    if (addMenuRef) {
      addMenuRef.scrollIntoView({ behavior: "auto", block: "center" });
      addMenuRef.focus();
    }
  }

  const { addField, updateEditor, tryFocusField } = getFormEditorContext() || {};

  function handleHover(e: CustomEvent<boolean>) {
    // @note: Prevent undesired hover events on other items while dragging
    isHover = e.detail;
  }

  function handleFocusIn(e: FocusEvent) {
    // @note: Prevent undesired hover events on other items while dragging
    isFocus = true;
    e.stopPropagation();
  }

  function handleFocusOut(e: FocusEvent) {
    // // @note: Prevent undesired hover events on other items while dragging
    isFocus = false;
    e.stopPropagation();
  }

  function handleAddField() {
    if (parentField.is.complete) return;

    showAddMenu = false;

    // @note: Add field directly instead of showing the dropdown option list
    if (parentField.type === "array" || parentField.controlType === "dictionary") {
      const [childOption] = parentField.options || [];

      addField(parentField, childOption);
      return;
    }

    showAddMenu = true;
  }

  function handleAddFieldMenuClose() {
    showAddMenu = false;
  }

  function focusNextField(nextField = field.getNextFocusableField()) {
    if (!nextField) return;
    tryFocusField(nextField, 5, 0);
  }

  function focusPrevField(prevField = field.getPrevFocusableField()) {
    if (!prevField) return;
    tryFocusField(prevField, 5, 0);
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
      if (nextItem?.isContainer() && !parentField.is.complete) {
        return handleAddField();
      } else {
        return focusNextField(nextItem);
      }
    } else if (goNext) {
      e.preventDefault();
      return focusNextField();
    } else if (goPrev) {
      e.preventDefault();
      return focusPrevField();
    }
  }
</script>

<svelte:window />

<div
  class="relative rounded expanded-area"
  use:hover
  on:hover={handleHover}
  on:keydown={handleKeyDown}
  on:focusin={handleFocusIn}
  on:focusout={handleFocusOut}
>
  <div>
    {#if showContextMenu}
      <FieldContextMenu {field} on:addField={handleAddField} />
    {/if}
    <div class="relative p-0.5 pl-2.5 pr-0" class:pr-2.5={!field.children}>
      <svelte:component this={componentsMap[field.type] || FallbackField} {field} />
    </div>
  </div>
</div>
{#if addMenu}
  <AddFieldMenu
    field={parentField}
    showModal={true}
    bind:inputRef={addMenuRef}
    on:closeAddFieldMenu={handleAddFieldMenuClose}
  />
{/if}
