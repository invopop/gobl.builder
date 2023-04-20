<script lang="ts">
  import * as monaco from "monaco-editor";
  import RootField from "./RootField.svelte";
  import { createFormEditorContext, getFormEditorContext } from "./context/formEditor.js";
  import { writable } from "svelte/store";
  import { editorProblems } from "$lib/stores.js";
  import CodeError from "./CodeError.svelte";

  export let jsonSchemaURL: string;

  let schemaURLStore = writable(jsonSchemaURL);
  $: schemaURLStore.set(jsonSchemaURL);

  createFormEditorContext(schemaURLStore);

  const { uiModel } = getFormEditorContext() || {};
  $: error = $editorProblems.filter((problem) => problem.severity === monaco.MarkerSeverity.Error)[0]?.message;

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

<div class="h-full overflow-y-scroll overflow-x-hidden">
  <div class="flex justify-center px-16 py-8 pb-40 text-sm">
    <div class="w-full max-w-2xl">
      {#if error}
        <div class="mb-8">
          <CodeError {error} />
        </div>
      {/if}

      {#if $uiModel.value}
        <RootField field={$uiModel.value} />
      {:else}
        Loading...
      {/if}
    </div>
  </div>
</div>
