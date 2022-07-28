<script lang="ts">
  import classNames from "classnames";
  import ModalBackdrop from "./ui/ModalBackdrop.svelte";
  import Modal from "./ui/Modal.svelte";
  import { draft, envelope } from "./stores";
  import EnvelopeHeader from "./EnvelopeHeader.svelte";

  $: envelopeExists = Boolean($envelope);
  let signaturesButtonEnabled = false;

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
</script>

<div class="flex items-center gap-4 bg-gray-200 px-4 py-2 text-xs shadow-inner">
  <div class="flex-1">
    <span class="mr-1">
      {#if draft}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
          <path
            fill-rule="evenodd"
            d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
            clip-rule="evenodd"
          />
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clip-rule="evenodd"
          />
        </svg>
      {/if}
    </span>
    <span class="align-middle">
      {$draft ? "Draft" : "Sealed document"}
    </span>
  </div>
  <div>
    <div
      id="tooltip-header"
      role="tooltip"
      class="inline-block absolute invisible z-10 py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
    >
      View the header of the built document.
      <div class="tooltip-arrow" data-popper-arrow />
    </div>
    <button
      data-tooltip-target="tooltip-header"
      class={classNames({
        hidden: !envelopeExists,
      })}
      on:click={handleHeaderClick}>Header</button
    >
  </div>
  <div>
    <div
      id="tooltip-signatures"
      role="tooltip"
      class="inline-block absolute invisible z-10 py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
    >
      {#if signaturesButtonEnabled}
        View the signatures of the sealed document.
      {:else}
        There are no signatures. They are generated when "sealing" a document.
      {/if}
      <div class="tooltip-arrow" data-popper-arrow />
    </div>
    <button
      data-tooltip-target="tooltip-signatures"
      class={classNames({
        hidden: !envelopeExists,
        "cursor-not-allowed text-gray-500": !signaturesButtonEnabled,
      })}>Signatures</button
    >
  </div>
</div>
