<script lang="ts">
  import LoadingIcon from "$lib/ui/LoadingIcon.svelte";
  import { build, getSchemas } from "../actions.js";
  import DynamicForm from "./DynamicForm.svelte";
  import type { DocumentHeader } from "$lib/types/editor.js";
  import { createEventDispatcher, setContext } from "svelte";
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
    envelopeIsSigned,
    activeSection,
  } = builderContext;

  setContext("editorId", editorId);

  const scrollPosition = writable(0);

  setContext("scrollPosition", scrollPosition);

  recreateFormEditor();

  export let forceReadOnly = false;

  let documentHeaders: DocumentHeader[] = [];

  // eslint-disable-next-line
  $: isEmptySchema = ($uiModel as any).value?.schema.$comment == "empty-schema";
  $: isValidSchema = !$jsonSchema || $currentEditorSchema === $jsonSchema;
  $: showSchemaField = isEmptySchema || !isValidSchema;

  $: {
    updateSchemaIfNeeded($jsonSchema || "");
  }

  // Update documentHeaders on editor change
  uiModel.subscribe((model) => {
    const fields = model.value;
    if (!fields) return;

    const rootKey = fields.key;
    const root = { slug: fields.id, label: `${rootKey.charAt(0).toUpperCase()}${rootKey.slice(1)}`, active: true };
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

      const schema = $currentEditorSchema || $jsonSchema || "";
      // If is not a valid schema we dont do anything
      if (!schemas.includes(schema)) return;

      // Recreate visual form with editor schema
      updateSchema(schema);
    }
  }

  export function recreateFormEditor() {
    // Forces editor watcher to fire and rebuild the model
    const temp = $jsonSchema;
    jsonSchema.set(null);
    jsonSchema.set(temp);
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

    const result = await build(builderContext);

    const isSuccess = !result?.error;

    dispatch("setState", isSuccess ? "built" : "errored");

    return isSuccess;
  }

  function setActive(header: DocumentHeader) {
    $activeSection = {
      section: header.slug,
      scroll: true,
    };
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="h-full relative flex" id={editorId}>
  {#if documentHeaders.length && !documentHeaders[0].slug.includes("root")}
    <div class="hidden @[820px]:block w-[168px] pt-[27px]">
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
  <div class="flex-1">
    <DynamicForm
      model={$uiModel.value}
      readOnly={$envelopeIsSigned || forceReadOnly}
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
