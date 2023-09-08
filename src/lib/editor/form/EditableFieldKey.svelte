<script lang="ts">
  import type { SchemaValue } from "$lib/editor/form/utils/schema.js";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import { getFormEditorContext } from "./context/formEditor.js";
  import EditableTextField from "./EditableTextField.svelte";
  import { Icon, PencilSquare } from "svelte-hero-icons";

  export let parseKey: (key: SchemaValue) => string = (key) => (key + "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
  export let field: UIModelField<string>;

  let pristine = true;
  $: showError = !pristine && field.is.error;
  let inputValue: SchemaValue = field.key;

  const { changeFieldKey } = getFormEditorContext() || {};

  function handleEdit(e: CustomEvent<SchemaValue>) {
    const value = e.detail;
    if (!value) return;

    inputValue = value;
  }

  function handleBlur() {
    pristine = false;

    if (!inputValue) return;

    const parsedKey = parseKey(inputValue);
    changeFieldKey(field, parsedKey);
  }
</script>

<span class="flex items-center justify-start">
  <Icon src={PencilSquare} solid class="h-4 w-4 mr-2 text-grey-5" />
  <EditableTextField
    {field}
    id={`${field.id}-key`}
    value={field.key}
    {showError}
    on:edit={handleEdit}
    on:blur={handleBlur}
  />
</span>
