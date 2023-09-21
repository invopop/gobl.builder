<script lang="ts">
  import {
    createFormEditorContext,
    getFormEditorContext,
    recreatingUiModel,
    schemaUrlForm,
  } from "./context/formEditor.js";
  import { currentEditorSchema, editor, jsonSchema } from "$lib/editor/stores.js";
  import LoadingIcon from "$lib/ui/LoadingIcon.svelte";
  import { getSchemas } from "../actions.js";
  import DynamicForm from "./DynamicForm.svelte";

  createFormEditorContext(schemaUrlForm);

  const { uiModel, updateSchema } = getFormEditorContext() || {};
  // eslint-disable-next-line
  $: isEmptySchema = ($uiModel as any).value?.schema.$comment == "empty-schema";
  $: isValidSchema = !$jsonSchema || $currentEditorSchema === $jsonSchema;
  $: showSchemaField = isEmptySchema || !isValidSchema;

  $: {
    updateSchemaIfNeeded($schemaUrlForm || "");
  }

  function handleKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") {
      document.dispatchEvent(new Event("redoButtonClick"));
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      document.dispatchEvent(new Event("undoButtonClick"));
      return;
    }
  }

  async function updateSchemaIfNeeded(formSchema: string) {
    // If editor schema is not the same as the form
    if ($currentEditorSchema !== formSchema) {
      const schemas = await getSchemas();

      const schema = $currentEditorSchema || $jsonSchema;
      // If is not a valid schema we dont do anything
      if (!schemas.includes(schema)) return;

      // Recreate visual form with editor schema
      updateSchema(schema);
    }
  }

  export function recreateFormEditor() {
    // Forces editor watcher to fire and rebuild the model
    schemaUrlForm.set(null);
    schemaUrlForm.set($jsonSchema);
  }

  function handleFormUpdated(event: CustomEvent) {
    handleUpdateEditor(event);
    recreateFormEditor();
  }

  function handleUpdateEditor(event: CustomEvent) {
    const model = event.detail;
    const value = model.root.toJSON();
    editor.set({ value, updatedAt: Date.now() });
  }
</script>

<svelte:window on:keydown={handleKeyDown} />
{#if $recreatingUiModel}
  <div class="text-center mt-6 w-full flex items-center justify-center"><LoadingIcon /></div>
{:else}
  <DynamicForm
    model={$uiModel.value}
    {showSchemaField}
    {isEmptySchema}
    on:uiRefreshNeeded={handleFormUpdated}
    on:fieldKeyUpdated={handleUpdateEditor}
    on:fieldValueUpdated={handleUpdateEditor}
  />
{/if}
