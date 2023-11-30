<script lang="ts">
  import {
    createFormEditorContext,
    getFormEditorContext,
    recreatingUiModel,
    schemaUrlForm,
  } from "./context/formEditor.js";
  import { currentEditorSchema, editor, envelopeIsSigned, jsonSchema } from "$lib/editor/stores.js";
  import LoadingIcon from "$lib/ui/LoadingIcon.svelte";
  import { getSchemas } from "../actions.js";
  import DynamicForm from "./DynamicForm.svelte";
  import type { DocumentHeader } from "$lib/types/editor.js";
  import { activeSection } from "$lib/store/visualEditor.js";

  createFormEditorContext(schemaUrlForm);

  const { uiModel, updateSchema } = getFormEditorContext() || {};

  export let forceReadOnly = false;
  let documentHeaders: DocumentHeader[] = [];

  // eslint-disable-next-line
  $: isEmptySchema = ($uiModel as any).value?.schema.$comment == "empty-schema";
  $: isValidSchema = !$jsonSchema || $currentEditorSchema === $jsonSchema;
  $: showSchemaField = isEmptySchema || !isValidSchema;

  $: {
    updateSchemaIfNeeded($schemaUrlForm || "");
  }

  // Update documentHeaders on editor change
  uiModel.subscribe((model) => {
    const fields = model.value;
    if (!fields) return;

    const rootKey = fields.key;
    const root = { slug: rootKey, label: `${rootKey.charAt(0).toUpperCase()}${rootKey.slice(1)}`, active: true };
    const items =
      fields.children
        ?.filter((f) => ["object", "array"].includes(f.type))
        .map((f) => ({
          slug: f.id,
          label: f.schema.title || "",
          active: false,
        })) || [];

    items.unshift(root);

    documentHeaders = items;
  });

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

  function setActive(header: DocumentHeader) {
    $activeSection = {
      section: header.slug,
      scroll: true,
    };
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="bg-white h-full relative">
  {#if $recreatingUiModel}
    <div class="text-center mt-6 w-full flex items-center justify-center"><LoadingIcon /></div>
  {:else}
    {#if documentHeaders.length && documentHeaders[0].slug !== "root"}
      <div class="pt-7 absolute top-0 left-0 bg-white hidden md:block md:w-36 lg:w-56 z-10">
        <ul>
          {#each documentHeaders as header}
            <li
              class:font-medium={$activeSection.section === header.slug}
              class:text-neutral-800={$activeSection.section === header.slug}
              class:text-neutral-400={$activeSection.section !== header.slug}
              class:border-neutral-800={$activeSection.section === header.slug}
              class:border-neutral-100={$activeSection.section !== header.slug}
              class="text-right px-3 py-1.5 text-sm border-r whitespace-nowrap"
            >
              <button
                on:click={() => {
                  setActive(header);
                }}>{header.label}</button
              >
            </li>
          {/each}
        </ul>
      </div>
    {/if}
    <DynamicForm
      model={$uiModel.value}
      readOnly={$envelopeIsSigned || forceReadOnly}
      {showSchemaField}
      {isEmptySchema}
      on:uiRefreshNeeded={handleFormUpdated}
      on:fieldKeyUpdated={handleUpdateEditor}
      on:fieldValueUpdated={handleUpdateEditor}
    />
  {/if}
</div>
