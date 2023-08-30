<script lang="ts">
  import * as monaco from "monaco-editor";
  import { clsx } from "clsx";
  import type { SvelteComponent } from "svelte";

  import ClearEditor from "$lib/actions/ClearEditor.svelte";
  import ExportDoc from "$lib/actions/ExportDoc.svelte";
  import Undo from "$lib/actions/Undo.svelte";
  import Redo from "$lib/actions/Redo.svelte";

  import ModalBackdrop from "$lib/ui/ModalBackdrop.svelte";
  import Modal from "$lib/ui/Modal.svelte";
  import { envelope, envelopeIsDraft, envelopeIsSigned, editorProblems } from "$lib/editor/stores.js";
  import EnvelopeHeader from "./EnvelopeHeader.svelte";
  import EnvelopeSignatures from "./EnvelopeSignatures.svelte";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import EditorViewButton from "$lib/ui/EditorViewButton.svelte";

  export let editorView: string;

  $: envelopeTooltip = $envelopeIsSigned
    ? "View the signatures of the sealed document."
    : "There are no signatures. They are generated when signing a document.";

  $: hasSyntaxErrors = !!$editorProblems.find((p) => p.owner === "json" && p.severity === monaco.MarkerSeverity.Error);

  function handleHeaderClick() {
    const modal = new Modal({
      target: document.body,
      props: {
        title: "Header",
        content: EnvelopeHeader as typeof SvelteComponent,
      },
    });

    const backdrop = new ModalBackdrop({
      target: document.body,
    });

    function handleClose() {
      modal.$destroy();
      backdrop.$destroy();
    }

    modal.$on("close", handleClose);
  }

  function handleSigsClick() {
    if (!$envelopeIsSigned) {
      return;
    }

    const modal = new Modal({
      target: document.body,
      props: {
        title: "Signatures",
        content: EnvelopeSignatures as typeof SvelteComponent,
      },
    });
    const backdrop = new ModalBackdrop({
      target: document.body,
    });

    function handleClose() {
      modal.$destroy();
      backdrop.$destroy();
    }

    modal.$on("close", handleClose);
  }

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
  <div class="flex gap-4 items-center">
    {#if $envelope}
      <div class="flex gap-2 text-gray-700">
        {#if $envelopeIsDraft}
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path
                fill-rule="evenodd"
                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          <span>Draft</span>
        {/if}
        {#if $envelopeIsSigned}
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          <span>Signed document</span>
        {/if}
      </div>
      <div class="border-l-2 pl-4 py-2">
        <Tooltip label="View the header of the built document.">
          <button on:click={handleHeaderClick}>Header</button>
        </Tooltip>
      </div>
      <div>
        <Tooltip label={envelopeTooltip}>
          <button
            class={clsx({
              "cursor-not-allowed text-gray-500": !$envelopeIsSigned,
            })}
            on:click={handleSigsClick}>Signatures</button
          >
        </Tooltip>
      </div>
    {/if}
  </div>
  <div class="flex justify-center">
    <div class="inline-flex bg-color3 border border-grey-1 rounded">
      <EditorViewButton
        disabled={hasSyntaxErrors}
        active={editorView === "form"}
        label={editorView !== "form"
          ? hasSyntaxErrors
            ? "Resolve errors before switching to visual editor"
            : "Swap to visual editor view"
          : undefined}
        on:click={() => (editorView = "form")}>Visual</EditorViewButton
      >
      <EditorViewButton
        active={editorView === "code"}
        label={editorView !== "code" ? "Swap to code editor view" : undefined}
        on:click={() => (editorView = "code")}>Code</EditorViewButton
      >
    </div>
  </div>
  <div class="flex justify-end">
    <div class="border-r-2 pr-2 mr-2">
      <Undo on:undo />
      <Redo on:redo />
      <ClearEditor on:clear />
    </div>
    <div>
      <ExportDoc on:preview on:download />
    </div>
  </div>
</div>
