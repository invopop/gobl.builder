<script lang="ts">
  import * as monaco from "monaco-editor";
  import type { SvelteComponent } from "svelte";
  import Undo from "$lib/actions/Undo.svelte";
  import Redo from "$lib/actions/Redo.svelte";
  import Modal from "$lib/ui/Modal.svelte";
  import { envelope, envelopeIsDraft, envelopeIsSigned, editorProblems } from "$lib/editor/stores.js";
  import EditorViewButton from "$lib/ui/EditorViewButton.svelte";
  import HeaderIcon from "$lib/ui/icons/HeaderIcon.svelte";
  import DraftIcon from "$lib/ui/icons/DraftIcon.svelte";
  import SignedIcon from "$lib/ui/icons/SignedIcon.svelte";

  export let editorView: string;

  let modalTitle = "";
  let modalComponent: typeof SvelteComponent | null = null;
  let openModal = false;

  $: hasSyntaxErrors = !!$editorProblems.find((p) => p.owner === "json" && p.severity === monaco.MarkerSeverity.Error);

  function handleKeyDown(e: KeyboardEvent) {
    if (!e.ctrlKey) return;

    if (e.key === "1") {
      editorView = "form";
    }

    if (e.key === "2") {
      editorView = "code";
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="flex items-center justify-between pl-4 pr-2 py-1 bg-slate-100 text-xs">
  <div class="flex gap-4 items-center flex-1">
    {#if $envelope}
      <div class="flex gap-2 text-gray-700">
        {#if $envelopeIsDraft}
          <div title="This document is a draft">
            <DraftIcon />
          </div>
        {/if}
        {#if $envelopeIsSigned}
          <button title="This document is signed. Click to view the signatures of the sealed document.">
            <SignedIcon />
          </button>
        {/if}
      </div>
      <div class="mt-1">
        <button title="View the header of the built document."><HeaderIcon /></button>
      </div>
    {/if}
  </div>
  <div class="flex justify-center flex-1">
    <div class="inline-flex bg-color3 border border-grey-1 rounded">
      <EditorViewButton
        disabled={hasSyntaxErrors}
        active={editorView === "form"}
        label={editorView !== "form" && hasSyntaxErrors
          ? "Resolve errors before switching to visual editor"
          : undefined}
        on:click={() => (editorView = "form")}>Visual</EditorViewButton
      >
      <EditorViewButton active={editorView === "code"} on:click={() => (editorView = "code")}>Code</EditorViewButton>
    </div>
  </div>
  <div class="flex justify-end flex-1">
    <div class="pr-2 mr-2">
      {#if editorView === "code"}
        <Undo on:undo />
        <Redo on:redo />
      {/if}
    </div>
  </div>
</div>
{#if openModal}
  <div>
    <div class="bg-black bg-opacity-70 fixed inset-0 z-40" />
    <Modal title={modalTitle} on:close={() => (openModal = false)}>
      <svelte:component this={modalComponent} />
    </Modal>
  </div>
{/if}
