<script context="module">
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
    object: ObjectField,
    array: ArrayField,
    string: StringField,
    integer: IntegerField,
  };

  let showContextMenu = false;
  let showAddMenuTop = false;
  let showAddMenuBot = false;
  let addMenuRef: HTMLElement;

  $: addMenuEmptyItem = field.isContainer() && (!field.children || field.children.length === 0) && !field.is.complete;
  $: addMenuTop = !addMenuEmptyItem && showAddMenuTop && !field.parent?.is.complete;
  $: addMenuBot = !addMenuEmptyItem && showAddMenuBot && !field.parent?.is.complete;

  $: {
    if (addMenuRef) {
      addMenuRef.scrollIntoView({ behavior: "auto", block: "center" });
      addMenuRef.focus();
    }
  }

  const { sortField } = getFormEditorContext() || {};

  function handleHover(e: CustomEvent<boolean>) {
    // @note: Prevent undesired hover events on other items while dragging
    if (isDragging) return;
    showContextMenu = e.detail;
  }

  function handleAddField(e: CustomEvent<boolean>) {
    if (e.detail) {
      showAddMenuTop = true;
    } else {
      showAddMenuBot = true;
    }
  }

  function handleAddFieldMenuTopClose() {
    showAddMenuTop = false;
  }

  function handleAddFieldMenuBotClose() {
    showAddMenuBot = false;
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
      (dragItemPosition === dropItemPosition - 1 && isBefore) ||
      (dragItemPosition === dropItemPosition + 1 && !isBefore)
    );
  }

  function handleDragStart(e: DragEvent) {
    e.stopPropagation();
    if (!e.dataTransfer) return;

    isDragging = true;

    const target = e.currentTarget as HTMLDivElement;
    const targetChild = target.firstChild as HTMLDivElement;

    target.classList.add(...dragClasses);
    setTimeout(() => {
      target.classList.add(...dragPlaceholderClasses);
      targetChild.classList.add(...dragChildPlaceholderClasses);
    }, 100);

    e.dataTransfer.clearData();
    e.dataTransfer.setData(`${field.id}:${field.index}`, "");

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
  }

  function handleDragOverWindow(e: DragEvent) {
    e.stopPropagation();
    e.preventDefault();
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer) return;

    const [dragFieldData] = e.dataTransfer.types;
    const [dragFieldId] = dragFieldData.split(":");
    const dropFieldId = field.id;

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
    console.log(e.key);

    if (e.key === "Enter") {
      e.preventDefault();

      const nextItem = field.getNextFocusableField();
      const nextItemEl = document.querySelector(`#${nextItem?.id}`) as HTMLElement;

      // @note: Jump to next item
      if (nextItemEl) {
        // todo
        nextItemEl.focus();
        e.stopPropagation();
        return;
      }

      handleAddField();
      e.stopPropagation();

      return;
    }
  }
</script>

<svelte:window on:dragover={handleDragOverWindow} />

{#if addMenuTop}
  <AddFieldMenu
    field={field.parent}
    position={field.index}
    bind:inputRef={addMenuRef}
    on:closeAddFieldMenu={handleAddFieldMenuTopClose}
  />
{/if}
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
>
  <div>
    {#if showContextMenu}
      <FieldContextMenu {field} on:addField={handleAddField} />
    {/if}
    <div
      class="relative p-2 pr-0"
      class:pr-2.5={!field.children}
      draggable="true"
      on:dragstart|preventDefault|stopPropagation
    >
      <svelte:component this={componentsMap[field.type] || FallbackField} {field} />
      {#if addMenuEmptyItem && !field.is.complete}
        <AddFieldMenu {field} bind:inputRef={addMenuRef} />
      {/if}
    </div>
  </div>
</div>
{#if addMenuBot}
  <AddFieldMenu
    field={field.parent}
    position={field.index + 1}
    bind:inputRef={addMenuRef}
    on:closeAddFieldMenu={handleAddFieldMenuBotClose}
  />
{/if}
