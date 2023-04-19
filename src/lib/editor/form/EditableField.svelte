<script lang="ts">
  import type { SchemaValue } from "$lib/editor/form/utils/schema.js";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import { getFormEditorContext } from "./context/formEditor.js";
  import EditableSelectField from "./EditableSelectField.svelte";
  import EditableInputField from "./EditableInputField.svelte";
  import EditableDateField from "./EditableDateField.svelte";
  import FieldError from "./FieldError.svelte";

  export let parseValue: (value: SchemaValue) => SchemaValue;
  export let field: UIModelField<string>;
  let pristine = true;
  $: showError = !pristine && field.is.error;

  const { changeField } = getFormEditorContext() || {};

  function handleEdit(e: CustomEvent<SchemaValue>) {
    const value = e.detail;
    if (!value) return;

    const parsedValue = parseValue(value);
    console.log(parsedValue);
    changeField(field, parsedValue);
  }

  function handleBlur() {
    pristine = false;
  }
</script>

{#if field.controlType === "date"}
  <EditableDateField {field} {showError} on:edit={handleEdit} on:blur={handleBlur} />
{:else if field.controlType === "select"}
  <EditableSelectField {field} {showError} options={field.controlMeta} on:edit={handleEdit} on:blur={handleBlur} />
{:else}
  <EditableInputField {field} {showError} on:edit={handleEdit} on:blur={handleBlur} />
{/if}
{#if showError}
  <FieldError {field} />
{/if}
