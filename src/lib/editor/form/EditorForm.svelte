<script lang="ts">
  import LoadingIcon from "$lib/ui/LoadingIcon.svelte";
  import { build, getSchemas } from "../actions.js";
  import DynamicForm from "./DynamicForm.svelte";
  import { createEventDispatcher, setContext, tick } from "svelte";
  import { getBuilderContext } from "$lib/store/builder.js";
  import { writable } from "svelte/store";

  const dispatch = createEventDispatcher();
  const editorId = `editor-${Math.random().toString(36).slice(2, 7)}`;

  const builderContext = getBuilderContext();

  const {
    jsonSchema,
    currentEditorSchema,
    someEditorValueIsEmpty,
    uiModel,
    recreatingUiModel,
    updateSchema,
    recreateEditor,
    envelope,
    lastFocusedElement,
  } = builderContext;

  setContext("editorId", editorId);

  const scrollPosition = writable(0);

  setContext("scrollPosition", scrollPosition);

  recreateFormEditor();

  export let forceReadOnly = false;
  export let removeStampsOnBuild = false;

  // eslint-disable-next-line
  $: isEmptySchema = ($uiModel as any).value?.schema.$comment == "empty-schema";
  $: isValidSchema = !$jsonSchema || $currentEditorSchema === $jsonSchema;
  $: showSchemaField = isEmptySchema || !isValidSchema;

  $: if (!forceReadOnly) {
    focusLastElement();
  }

  $: {
    updateSchemaIfNeeded($jsonSchema || "");
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

      const schema = $currentEditorSchema || $jsonSchema || "";
      // If is not a valid schema we dont do anything
      if (!schemas.includes(schema)) return;

      // Recreate visual form with editor schema
      updateSchema(schema);
    }
  }

  export function recreateFormEditor() {
    // Forces editor watcher to fire and rebuild the model
    recreateEditor();
  }

  async function handleFormUpdated(event: CustomEvent) {
    handleUpdateEditor(event);
    await handleBuild();
    recreateFormEditor();
  }

  async function handleFieldUpdated(event: CustomEvent) {
    handleUpdateEditor(event);

    const result = await handleBuild();

    if (result) {
      recreateFormEditor();
    }
  }

  async function handleUpdateEditor(event: CustomEvent) {
    const model = event.detail;
    const value = model.root.toJSON();
    builderContext.editor.set({ value, updatedAt: Date.now() });
  }

  async function handleBuild() {
    // Skips autobuild if any field is empty. Allowing user to add new
    // fields without having them deleted
    if ($someEditorValueIsEmpty) return false;

    const result = await build(builderContext, { removeStamps: removeStampsOnBuild });

    const isSuccess = !result?.error;

    dispatch("setState", isSuccess ? "built" : "errored");

    return isSuccess;
  }

  async function focusLastElement() {
    if (!$lastFocusedElement) return;
    await tick();
    const element = document.getElementById($lastFocusedElement);
    if (!element) return;
    element.focus();
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="h-full relative flex" id={editorId}>
  <div class="flex-1">
    <DynamicForm
      model={$uiModel.value}
      readOnly={forceReadOnly || !!$envelope.sigs}
      {showSchemaField}
      {isEmptySchema}
      on:uiRefreshNeeded={handleFormUpdated}
      on:fieldKeyUpdated={handleFieldUpdated}
      on:fieldValueUpdated={handleFieldUpdated}
    />
  </div>

  {#if $recreatingUiModel}
    <div class="text-center mt-6 w-full flex items-center justify-center"><LoadingIcon /></div>
  {/if}
</div>
