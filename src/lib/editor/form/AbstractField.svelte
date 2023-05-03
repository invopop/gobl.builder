<script lang="ts" context="module">
  let isDragging = false;
</script>

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

  let showContextMenu = false;
  let showAddMenu = false;
  let addMenuRef: HTMLElement;

  $: parentField = field.parent as UIModelField;
  $: addMenuEmptyItem = field.isContainer() && (!field.children || field.children.length === 0) && !field.is.complete;
  $: addMenu = !addMenuEmptyItem && showAddMenu && !parentField.is.complete;

  $: {
    if (addMenuRef) {
      addMenuRef.scrollIntoView({ behavior: "auto", block: "center" });
      addMenuRef.focus();
    }
  }

  const { sortField, addField, updateEditor } = getFormEditorContext() || {};

  function handleHover(e: CustomEvent<boolean>) {
    // @note: Prevent undesired hover events on other items while dragging
    if (isDragging) return;
    showContextMenu = e.detail;
  }

  function handleFocusIn(e: FocusEvent) {
    // @note: Prevent undesired hover events on other items while dragging
    if (isDragging) return;
    showContextMenu = true;
    e.stopPropagation();
  }

  function handleFocusOut(e: FocusEvent) {
    // // @note: Prevent undesired hover events on other items while dragging
    if (isDragging) return;
    showContextMenu = false;
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

  const dragClasses = ["transform-gpu"];
  const dragPlaceholderClasses = ["bg-gray-300", "mx-2"];
  const dragChildPlaceholderClasses = ["invisible"];

  function isDroppingBeforeField(e: DragEvent, dropTarget: HTMLDivElement) {
    const { y, height } = dropTarget.getBoundingClientRect();
    const dropItemCenterY = y + height / 2;
    return e.pageY < dropItemCenterY;
  }

  function isDroppablePosition(dragField: UIModelField, dropField: UIModelField, isBefore: boolean): boolean {
    const dragItemPosition = dragField.index;
    const dropItemPosition = dropField.index;

    // @note: Calculate when the final state will be exactly the same than the initial
    // and skip from recalculating the UI model
    return !(
      dragField.id === dropField.id ||
      dragItemPosition === dropItemPosition ||
      (dragItemPosition === dropItemPosition - 1 && isBefore) ||
      (dragItemPosition === dropItemPosition + 1 && !isBefore)
    );
  }

  function handleDragStart(e: DragEvent) {
    e.stopPropagation();
    if (!e.dataTransfer) return;

    if (!field.parent?.isArray() || field.parent.children?.length === 1) {
      return e.preventDefault();
    }

    const target = e.currentTarget as HTMLDivElement;
    const targetChild = target.firstChild as HTMLDivElement;

    target.classList.add(...dragClasses);
    setTimeout(() => {
      target.classList.add(...dragPlaceholderClasses);
      targetChild.classList.add(...dragChildPlaceholderClasses);
    }, 100);

    isDragging = true;

    e.dataTransfer.clearData();
    e.dataTransfer.setData(field.id, "");

    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd(e: DragEvent) {
    e.stopPropagation();
    if (!e.dataTransfer) return;

    isDragging = false;

    const target = e.currentTarget as HTMLDivElement;
    const targetChild = target.firstChild as HTMLDivElement;

    target.classList.remove(...dragClasses);
    target.classList.remove(...dragPlaceholderClasses);
    targetChild.classList.remove(...dragChildPlaceholderClasses);

    updateEditor();
  }

  function handleDragOverWindow(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer) return;

    const [dragFieldId] = e.dataTransfer.types;
    const dropFieldId = field.id;

    if (!dragFieldId) return;

    // @note: Quick check level of nesting (not same item & same nesting level)
    let canDrop = dragFieldId.split("-").length === dropFieldId.split("-").length;
    if (!canDrop) return;

    // @note: Only stop propagation after reaching the shared parent nesting level
    e.stopPropagation();

    const dragField = field.findFieldById(dragFieldId);
    const dropField = field;

    if (!dragField) return;

    // @note: Check that the item is droppable on the current position (same parent container)
    canDrop = dragField.parent?.id === dropField.parent?.id;
    if (!canDrop) return;

    const target = e.currentTarget as HTMLDivElement;
    const isBefore = isDroppingBeforeField(e, target);

    canDrop = isDroppablePosition(dragField, dropField, isBefore);
    if (!canDrop) return;

    const dropPosition = dropField.index + (isBefore ? 0 : 1);
    sortField(dragField, dropPosition);
  }

  function handleKeyDown(e: KeyboardEvent) {
    const goPrev = e.key === "ArrowUp" || (e.shiftKey && e.key === "Tab");
    const goNext = e.key === "ArrowDown" || (!e.shiftKey && e.key === "Tab");
    const goAdd = e.key === "Enter";

    if (
      (e.key === "ArrowDown" || e.key === "ArrowUp") &&
      (field.controlType === "select" || field.controlType === "date")
    ) {
      return;
    }

    if (goAdd) {
      e.preventDefault();
      const nextItem = field.getNextFocusableField();
      const nextItemEl = document.querySelector(`#${nextItem?.id}`) as HTMLElement;
      console.log("NEXT ENT", nextItemEl);

      // @note: Focus the next field
      if (nextItemEl) {
        nextItemEl.focus();
        e.stopPropagation();
        return;
      }

      // @note: Last item but the parent is not complete, show the add field menu
      if (!parentField.is.complete) {
        handleAddField();
        e.stopPropagation();
      }

      // @note: Dont stop stop propagation here to go up on level in the tree and keep finding
      return;
    } else if (goNext) {
      e.preventDefault();
      const nextItem = field.getNextFocusableField();
      const nextItemEl = document.querySelector(`#${nextItem?.id}`) as HTMLElement;

      console.log("NEXT", nextItemEl);

      // @note: Focus the next field
      if (nextItemEl) {
        nextItemEl.focus();
        e.stopPropagation();
        return;
      }

      // @note: Dont stop stop propagation here to go up on level in the tree and keep finding
      return;
    } else if (goPrev) {
      e.preventDefault();
      const prevItem = field.getPrevFocusableField();
      const prevItemEl = document.querySelector(`#${prevItem?.id}`) as HTMLElement;

      console.log("PREV", prevItemEl);

      // @note: Focus the prev field
      if (prevItemEl) {
        prevItemEl.focus();
        e.stopPropagation();
        return;
      }

      // @note: Dont stop stop propagation here to go up on level in the tree and keep finding
      return;
    }
  }
</script>

<svelte:window on:dragover={handleDragOverWindow} />

<div
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  on:dragover={handleDragOver}
  on:dragenter|preventDefault
  draggable="true"
  class="relative rounded expanded-area"
  use:hover
  on:hover={handleHover}
  on:keydown={handleKeyDown}
  on:focusin={handleFocusIn}
  on:focusout={handleFocusOut}
>
  <div class:my-6={field.isContainer() && field.level <= 1}>
    {#if showContextMenu}
      <FieldContextMenu {field} on:addField={handleAddField} />
    {/if}
    <div
      class="relative p-1.5 pl-2.5 pr-0"
      class:pr-2.5={!field.children}
      draggable="true"
      on:dragstart|preventDefault|stopPropagation
    >
      <svelte:component this={componentsMap[field.type] || FallbackField} {field} />
      {#if addMenuEmptyItem}
        <AddFieldMenu {field} bind:inputRef={addMenuRef} showModal={false} showButton={true} />
      {/if}
    </div>
  </div>
</div>
{#if addMenu}
  <AddFieldMenu
    field={parentField}
    showModal={true}
    showButton={false}
    bind:inputRef={addMenuRef}
    on:closeAddFieldMenu={handleAddFieldMenuClose}
  />
{/if}
