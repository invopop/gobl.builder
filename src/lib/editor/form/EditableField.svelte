<script lang="ts">
  import type { SchemaValue } from "$lib/editor/form/utils/schema.js";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import EditableSelectField from "./EditableSelectField.svelte";
  import EditableTextField from "./EditableTextField.svelte";
  import EditableDateField from "./EditableDateField.svelte";
  import FieldError from "./FieldError.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let parseValue: (value: SchemaValue) => SchemaValue;
  export let field: UIModelField<string>;

  let error = "";
  $: showError = Boolean(error);

  function handleEdit(e: CustomEvent<SchemaValue>) {
    const value = e.detail;

    const parsedValue = parseValue(value);
    const result = field.setValue(parsedValue as string);
    if (!result) return;
    dispatch("fieldValueUpdated", field);
  }

  function isEmpty(value: SchemaValue) {
    return value === null || value === "" || value === undefined;
  }

  function validateField(e: CustomEvent<SchemaValue>) {
    const value = e.detail;
    const parsedValue = parseValue(value);

    if (field.is.required) {
      error = isEmpty(parsedValue) ? "Required field" : "";
      return;
    }

    if (field.schema.pattern) {
      const pattern = new RegExp(field.schema.pattern);
      const valid = pattern.test(parsedValue as string);

      error = valid ? "" : `Invalid format ${field.schema.pattern}`;
    }
  }
</script>

<div class="w-full">
  {#if field.controlType === "date"}
    <EditableDateField {field} {showError} on:edit={handleEdit} on:blur={validateField} />
  {:else if field.controlType === "select"}
    <EditableSelectField {field} {showError} options={field.controlMeta} on:edit={handleEdit} on:blur={validateField} />
  {:else if field.type === "boolean"}
    <EditableSelectField
      {field}
      {showError}
      options={[
        { key: "Yes", value: true },
        { key: "No", value: false },
      ]}
      on:edit={handleEdit}
      on:blur={validateField}
    />
  {:else}
    <EditableTextField {field} {showError} on:edit={handleEdit} on:blur={validateField} />
  {/if}
  {#if showError}
    <FieldError {error} />
  {/if}
</div>
