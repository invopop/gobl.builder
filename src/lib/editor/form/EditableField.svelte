<script lang="ts">
  import type { SchemaValue } from '$lib/editor/form/utils/schema.js'
  import EditableSelectField from './EditableSelectField.svelte'
  import EditableTextField from './EditableTextField.svelte'
  import EditableDateField from './EditableDateField.svelte'
  import FieldError from './FieldError.svelte'
  import ReadOnlyField from './ReadOnlyField.svelte'
  import { getBuilderContext } from '$lib/store/builder'
  import type { EditableFieldProps } from '$lib/types/editor'
  import { UIModelField } from './utils/model'

  const builderContext = getBuilderContext()

  const { lastFocusedElement } = builderContext

  let { parseValue, field, readOnly = false, onFieldValueUpdated }: EditableFieldProps = $props()

  let error = $state('')
  let showError = $derived(Boolean(error))

  function handleEdit(value: SchemaValue) {
    const parsedValue = parseValue(value)
    const result = field.setValue(parsedValue as string)
    if (!result) return
    onFieldValueUpdated?.(field)
  }

  function isEmpty(value: SchemaValue) {
    return value === null || value === '' || value === undefined
  }

  function validateField(value: SchemaValue) {
    const parsedValue = parseValue(value)

    if (field.is.required && isEmpty(parsedValue)) {
      error = 'Required field'
      return
    }

    if (field.schema.pattern) {
      const pattern = new RegExp(field.schema.pattern)
      const valid = pattern.test(parsedValue as string)

      error = valid ? '' : `Invalid format ${field.schema.pattern}`
    }
  }

  function handleFocus(event: FocusEvent) {
    const target = event.target as HTMLInputElement
    lastFocusedElement.set(target.id)
  }
</script>

<div class="w-full space-y-1 flex flex-col">
  {#if readOnly}
    <ReadOnlyField {field} />
  {:else if field.controlType === 'date'}
    <EditableDateField
      field={field as UIModelField<string>}
      {showError}
      onEdit={handleEdit}
      onBlur={validateField}
    />
  {:else if field.controlType === 'select'}
    <EditableSelectField
      field={field as UIModelField<string>}
      {showError}
      options={field.controlMeta}
      onEdit={handleEdit}
      onBlur={validateField}
      onfocus={handleFocus}
    />
  {:else if field.type === 'boolean'}
    <EditableSelectField
      field={field as UIModelField<string>}
      {showError}
      options={[
        { label: '', value: '' },
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]}
      onEdit={handleEdit}
      onBlur={validateField}
      onfocus={handleFocus}
    />
  {:else}
    <EditableTextField
      field={field as UIModelField<string>}
      {showError}
      onEdit={handleEdit}
      onBlur={validateField}
      onfocus={handleFocus}
    />
  {/if}
  {#if showError}
    <FieldError {error} />
  {/if}
</div>
