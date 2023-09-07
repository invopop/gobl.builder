<script lang="ts">
  import * as monaco from "monaco-editor";
  import { toast } from "@zerodevx/svelte-toast";
  import {
    createFormEditorContext,
    getFormEditorContext,
    recreatingUiModel,
    schemaUrlForm,
  } from "./context/formEditor.js";
  import { editorProblems } from "$lib/editor/stores.js";
  import AbstractField from "./AbstractField.svelte";
  import LoadingIcon from "$lib/ui/LoadingIcon.svelte";

  let error = "";

  createFormEditorContext(schemaUrlForm);

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
