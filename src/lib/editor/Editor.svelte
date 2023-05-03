<script lang="ts">
  import { editorViewType } from "$lib/stores.js";
  import CodeEditor from "./code/CodeEditor.svelte";
  import FormEditor from "./form/FormEditor.svelte";
  import EditorToolbar from "./EditorToolbar.svelte";
  import { getChangeViewHandler } from "./form/utils/tab.js";

  export let jsonSchemaURL: string;

  const handleViewCode = getChangeViewHandler("code");
  const handleViewForm = getChangeViewHandler("form");

  function handleKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === "1") {
      handleViewForm();
      return;
    }

    if (e.ctrlKey && e.key === "2") {
      handleViewCode();
      return;
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="flex flex-col h-full">
  <div class="relative flex-1 overflow-hidden">
    <div class="h-full absolute inset-0" class:invisible={$editorViewType !== "code"}>
      <CodeEditor {jsonSchemaURL} />
    </div>
    <div class="h-full absolute inset-0" class:invisible={$editorViewType !== "form"}>
      <FormEditor {jsonSchemaURL} />
    </div>
  </div>
  <EditorToolbar />
</div>
