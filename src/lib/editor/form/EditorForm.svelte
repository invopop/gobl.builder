<script lang="ts">
  import {
    createFormEditorContext,
    getFormEditorContext,
    recreatingUiModel,
    schemaUrlForm,
  } from "./context/formEditor.js";
  import { currentEditorSchema, jsonSchema } from "$lib/editor/stores.js";
  import AbstractField from "./AbstractField.svelte";
  import LoadingIcon from "$lib/ui/LoadingIcon.svelte";
  import { getSchemas } from "../actions.js";
  import SchemaField from "./SchemaField.svelte";

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
    // If editor has a fixed schema we dont need to perform any action
    if ($jsonSchema) return;

    // If editor schema is not the same as the form
    if ($currentEditorSchema !== formSchema) {
      const schemas = await getSchemas();
      // If is not a valid schema we dont do anything
      if (!schemas.includes($currentEditorSchema)) return;

      // Recreate visual form with editor schema
      updateSchema($currentEditorSchema);
    }
  }

  export function recreateFormEditor() {
    // Forces editor watcher to fire and rebuild the model
    schemaUrlForm.set(null);
    schemaUrlForm.set($jsonSchema);
  }
</script>

<svelte:window on:keydown={handleKeyDown} />
{#if $recreatingUiModel}
  <div class="text-center mt-6 w-full flex items-center justify-center"><LoadingIcon /></div>
{:else}
  <div class="h-full overflow-y-auto overflow-x-hidden bg-color1">
    <div class="flex justify-center px-16 py-8 pb-40 text-sm">
      <div class="w-full max-w-[536px]">
        {#if showSchemaField}
          <SchemaField {isEmptySchema} />
        {:else if $uiModel.value}
          <AbstractField field={$uiModel.value} />
        {/if}
      </div>
    </div>
  </div>
{/if}
