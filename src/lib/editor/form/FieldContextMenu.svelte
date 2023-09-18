<script lang="ts">
  import { getFormEditorContext } from "./context/formEditor.js";
  import { createEventDispatcher } from "svelte";
  import FieldButtons from "$lib/editor/form/FieldButtons.svelte";
  import type { UIModelField } from "./utils/model.js";

  const { deleteField, duplicateField, moveField } = getFormEditorContext() || {};
  const dispatch = createEventDispatcher();

  export let field: UIModelField;
</script>

<FieldButtons
  {field}
  on:add={() => dispatch("addField")}
  on:duplicate={() => duplicateField(field)}
  on:remove={() => deleteField(field)}
  on:moveUp={() => moveField(field, "up")}
  on:moveDown={() => moveField(field, "down")}
/>
