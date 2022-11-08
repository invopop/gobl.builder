<script lang="ts">
  import { clsx } from "clsx";

  import ClearEditor from "$lib/actions/ClearEditor.svelte";
  import ExportDoc from "$lib/actions/ExportDoc.svelte";
  import Undo from "$lib/actions/Undo.svelte";
  import Redo from "$lib/actions/Redo.svelte";
  import Build from "$lib/actions/Build.svelte";
  import Validate from "$lib/actions/Validate.svelte";
  import Sign from "$lib/actions/Sign.svelte";

  import ModalBackdrop from "$lib/ui/ModalBackdrop.svelte";
  import Modal from "$lib/ui/Modal.svelte";
  import { envelope, envelopeIsDraft, envelopeIsSigned } from "$lib/stores.js";
  import EnvelopeHeader from "./EnvelopeHeader.svelte";
  import EnvelopeSignatures from "./EnvelopeSignatures.svelte";
  import Tooltip from "$lib/ui/Tooltip.svelte";

  export let jsonSchemaURL: string;
  export let signEnabled: boolean;

  $: envelopeHasSigs = Boolean($envelope?.sigs);

  function handleHeaderClick() {
    const modal = new Modal({
      target: document.body,
      props: {
        title: "Header",
        content: EnvelopeHeader,
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
    if (!envelopeHasSigs) {
      return;
    }

    const modal = new Modal({
      target: document.body,
      props: {
        title: "Signatures",
        content: EnvelopeSignatures,
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

  $: envelopeTooltip = envelopeHasSigs
    ? "View the signatures of the sealed document."
    : "There are no signatures. They are generated when signing a document.";
</script>

<div class="flex gap-4 items-center pl-4 pr-2 py-1 bg-slate-100 text-xs">
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
            "cursor-not-allowed text-gray-500": !envelopeHasSigs,
          })}
          on:click={handleSigsClick}>Signatures</button
        >
      </Tooltip>
    </div>
  {/if}
  <div class="flex-1 flex justify-end">
    <div class="border-r-2 pr-2 mr-2">
      <Undo on:undo />
      <Redo on:redo />
      <ClearEditor on:clear />
    </div>
    <div class="border-r-2 pr-2 mr-2">
      <Build {jsonSchemaURL} on:build />
      {#if signEnabled}
        <Sign {jsonSchemaURL} on:sign />
      {/if}
      <Validate {jsonSchemaURL} on:validate />
    </div>
    <div>
      <ExportDoc on:preview on:download />
    </div>
  </div>
</div>
