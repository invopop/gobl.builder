<script lang="ts">
  import { getFormEditorContext } from "./context/formEditor.js";
  import { createEventDispatcher } from "svelte";
  import FieldButtons from "$lib/editor/form/FieldButtons.svelte";
  import type { UIModelField } from "./utils/model.js";

  const { moveField } = getFormEditorContext() || {};
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
</script>

<FieldButtons
  {field}
  on:add={() => dispatch("addField")}
  on:duplicate={handleDuplicate}
  on:remove={handleRemove}
  on:moveUp={() => moveField(field, "up")}
  on:moveDown={() => moveField(field, "down")}
/>
