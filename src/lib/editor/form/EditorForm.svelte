<script lang="ts">
  import {
    createFormEditorContext,
    getFormEditorContext,
    recreatingUiModel,
    schemaUrlForm,
  } from "./context/formEditor.js";
  import { jsonSchema } from "$lib/editor/stores.js";
  import AbstractField from "./AbstractField.svelte";
  import LoadingIcon from "$lib/ui/LoadingIcon.svelte";

  createFormEditorContext(schemaUrlForm);

  const { uiModel } = getFormEditorContext() || {};

  export function recreateFormEditor() {
    // Forces editor watcher to fire and rebuild the model
    schemaUrlForm.set(null);
    schemaUrlForm.set($jsonSchema);
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
</script>

<svelte:window on:keydown={handleKeyDown} />
{#if $recreatingUiModel}
  <div class="text-center mt-6 w-full flex items-center justify-center"><LoadingIcon /></div>
{:else}
  <div class="h-full overflow-y-auto overflow-x-hidden bg-color1">
    <div class="flex justify-center px-16 py-8 pb-40 text-sm">
      <div class="w-full max-w-[536px]">
        {#if $uiModel.value}
          <AbstractField field={$uiModel.value} />
        {/if}
      </div>
    </div>
  </div>
{/if}
