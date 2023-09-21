<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import FieldButtons from "$lib/editor/form/FieldButtons.svelte";
  import type { UIModelField } from "./utils/model.js";

  const dispatch = createEventDispatcher();

  export let field: UIModelField;

  function handleRemove() {
    field.delete();
    dispatch("fieldDeleted");
  }

  function handleDuplicate() {
    const newField = field.duplicate();
    if (!newField) return;

    const focusField = newField.getFirstFocusableChild();

    if (!focusField) return;

    focusField.tryFocus();
    dispatch("fieldDuplicated", newField);
  }

  function handleModeFieldUp() {
    field.move("up");
    dispatch("fieldMoved", field);
  }

  function handleModeFieldDown() {
    field.move("down");
    dispatch("fieldMoved", field);
  }
</script>

<FieldButtons
  {field}
  on:add={() => dispatch("addField")}
  on:duplicate={handleDuplicate}
  on:remove={handleRemove}
  on:moveUp={handleModeFieldUp}
  on:moveDown={handleModeFieldDown}
/>
