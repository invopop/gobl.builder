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

  export let field: UIModelField;

  const componentsMap: Record<string, typeof SvelteComponent> = {
    object: ObjectField,
    array: ArrayField,
    string: StringField,
    integer: IntegerField,
  };

  let showContextMenu = false;
  let showAddMenu = false;

  const { sortField } = getFormEditorContext() || {};

  function handleHover(e: CustomEvent<boolean>) {
    showContextMenu = e.detail;
  }

  function handleAddField() {
    showAddMenu = true;
  }

  function handleAddFieldMenuClose() {
    showAddMenu = false;
  }

  const dragClasses = ["transform-gpu", "border", "border-black-600", "cursor-move"];
  const dropClasses = ["border-t-gray-600", "border-b-gray-600"];

  function isDroppedBeforeField(e: DragEvent, dropTarget: HTMLDivElement) {
    const { y, height } = dropTarget.getBoundingClientRect();
    const dropItemCenterY = y + height / 2;
    return e.pageY < dropItemCenterY;
  }

  function handleDragStart(e: DragEvent) {
    e.stopPropagation();
    if (!e.dataTransfer) return;

    const target = e.currentTarget as HTMLDivElement;

    target.classList.add(...dragClasses);

    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.effectAllowed = "move";

    e.dataTransfer.clearData();
    e.dataTransfer.setData(field.id, target.id);
  }

  function handleDragEnd(e: DragEvent) {
    e.stopPropagation();
    if (!e.dataTransfer) return;

    const target = e.currentTarget as HTMLDivElement;
    target.classList.remove(...dragClasses);
  }

  function handleDragOver(e: DragEvent) {
    e.stopPropagation();
    if (!e.dataTransfer) return;

    const [dragFieldId] = e.dataTransfer.types;
    const dropFieldId = field.id;

    // @note: Quick check level of nesting (not same item & same nesting level)
    let allowDrop = dragFieldId !== dropFieldId && dragFieldId.split("-").length === dropFieldId.split("-").length;
    if (!allowDrop) return;

    const dragField = field.findFieldById(dragFieldId);
    const dropField = field;

    // @note: Check that the item is droppable on the current position (same parent container)
    allowDrop = !!dragField && dragField.parent?.id === dropField.parent?.id;

    if (allowDrop) {
      const target = e.currentTarget as HTMLDivElement;
      const isBefore = isDroppedBeforeField(e, target);

      target.classList.remove(...dropClasses);
      target.classList.add(dropClasses[isBefore ? 0 : 1]);

      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  }

  function handleDragLeave(e: DragEvent) {
    e.stopPropagation();
    if (!e.dataTransfer) return;

    const target = e.currentTarget as HTMLDivElement;

    target.classList.remove(...dropClasses);
  }

  function handleDrop(e: DragEvent) {
    e.stopPropagation();
    if (!e.dataTransfer) return;

    const target = e.currentTarget as HTMLDivElement;

    target.classList.remove(...dropClasses);

    const [dragFieldId] = e.dataTransfer.types;
    const dragField = field.findFieldById(dragFieldId);
    const dropField = field;

    if (!dragField) return;

    const isBefore = isDroppedBeforeField(e, target);
    const position = dropField.index + (isBefore ? 0 : 1);
    console.log("🟢 MOVE item from position", dragField.index, " to position ", position);

    sortField(dragField, position);
  }
</script>

<div
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:dragenter|preventDefault
  on:drop={handleDrop}
  draggable="true"
  class="relative border-transparent border-t-4 border-b-4"
  use:hover
  on:hover={handleHover}
>
  {#if showContextMenu}
    <FieldContextMenu {field} on:addField={handleAddField} />
  {/if}
  <div class="relative p-2" class:pr-0={!!field.children} draggable="true" on:dragstart|preventDefault|stopPropagation>
    <svelte:component
      this={componentsMap[field.type] || FallbackField}
      {field}
      {showAddMenu}
      on:closeAddFieldMenu={handleAddFieldMenuClose}
    />
  </div>
</div>
