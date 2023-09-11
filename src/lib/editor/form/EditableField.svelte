<script lang="ts">
  import type { SchemaValue } from "$lib/editor/form/utils/schema.js";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import { getFormEditorContext } from "./context/formEditor.js";
  import EditableSelectField from "./EditableSelectField.svelte";
  import EditableTextField from "./EditableTextField.svelte";
  import EditableDateField from "./EditableDateField.svelte";
  import FieldError from "./FieldError.svelte";

  export let parseValue: (value: SchemaValue) => SchemaValue;
  export let field: UIModelField<string>;

  let error = "";
  $: showError = Boolean(error);

  const { changeFieldValue } = getFormEditorContext() || {};

  function handleEdit(e: CustomEvent<SchemaValue>) {
    const value = e.detail;
    if (!value) return;

    const parsedValue = parseValue(value);
    changeFieldValue(field, parsedValue);
  }

  function validateField(e: CustomEvent<SchemaValue>) {
    const value = e.detail;
    const parsedValue = parseValue(value);

    if (field.is.required) {
      error = parsedValue ? "" : "Required field";
      return;
    }

    if (field.schema.pattern) {
      const pattern = new RegExp(field.schema.pattern);
      const valid = pattern.test(parsedValue as string);

      if (!valid) {
        error = `Invalid format ${field.schema.pattern}`;
      }
    }
  }
</script>

<div class="w-full">
  {#if field.controlType === "date"}
    <EditableDateField {field} {showError} on:edit={handleEdit} on:blur={validateField} />
  {:else if field.controlType === "select"}
    <EditableSelectField {field} {showError} options={field.controlMeta} on:edit={handleEdit} on:blur={validateField} />
  {:else}
    <EditableTextField {field} {showError} on:edit={handleEdit} on:blur={validateField} />
  {/if}
  {#if showError}
    <FieldError {error} />
  {/if}
</div>
