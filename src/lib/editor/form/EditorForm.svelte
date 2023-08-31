<script lang="ts">
  import * as monaco from "monaco-editor";
  import { toast } from "@zerodevx/svelte-toast";
  import { createFormEditorContext, getFormEditorContext } from "./context/formEditor.js";
  import { writable } from "svelte/store";
  import { editorProblems } from "$lib/editor/stores.js";
  import AbstractField from "./AbstractField.svelte";

  export let jsonSchemaURL: string;

  let error = "";
  let schemaURLStore = writable(jsonSchemaURL);
  $: schemaURLStore.set(jsonSchemaURL);

  createFormEditorContext(schemaURLStore);

  const { uiModel } = getFormEditorContext() || {};
  $: {
    error = $editorProblems.filter((problem) => problem.severity === monaco.MarkerSeverity.Error)[0]?.message;

    if (error) {
      toast.push(error, {
        reversed: true,
        intro: { y: 192 },
        theme: {
          "--toastColor": "rgb(75 85 99)",
          "--toastBackground": "rgb(255 228 230)",
          "--toastBarBackground": "rgb(225 29 72)",
        },
      });
    }
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

<div class="h-full overflow-y-auto overflow-x-hidden bg-color1">
  <div class="flex justify-center px-16 py-8 pb-40 text-sm">
    <div class="w-full max-w-[536px]">
      {#if $uiModel.value}
        <AbstractField field={$uiModel.value} />
      {:else}
        Loading...
      {/if}
    </div>
  </div>
</div>
