<script lang="ts">
  import { Tooltip } from "flowbite-svelte";
  import { clsx } from "clsx";

  import ModalBackdrop from "$lib/ui/ModalBackdrop.svelte";
  import Modal from "$lib/ui/Modal.svelte";
  import { envelope, envelopeIsDraft, envelopeIsSigned } from "$lib/stores.js";
  import EnvelopeHeader from "./EnvelopeHeader.svelte";
  import EnvelopeSignatures from "./EnvelopeSignatures.svelte";

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
</script>

{#if $envelope}
  <div class="flex items-center gap-4 bg-gray-200 px-4 py-2 text-xs shadow-inner">
    <div class="flex-1 inline-flex items-center gap-2 text-gray-700">
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
    <div>
      <Tooltip
        triggeredBy="#tooltip-header"
        tipClass="py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm transition-opacity duration-300"
      >
        View the header of the built document.
      </Tooltip>
      <button id="tooltip-header" on:click={handleHeaderClick}>Header</button>
    </div>
    <div>
      <Tooltip
        triggeredBy="#tooltip-signatures"
        tipClass="py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm transition-opacity duration-300"
      >
        {#if envelopeHasSigs}
          View the signatures of the sealed document.
        {:else}
          There are no signatures. They are generated when signing a document.
        {/if}
      </Tooltip>
      <button
        id="tooltip-signatures"
        class={clsx({
          "cursor-not-allowed text-gray-500": !envelopeHasSigs,
        })}
        on:click={handleSigsClick}>Signatures</button
      >
    </div>
  </div>
{/if}
