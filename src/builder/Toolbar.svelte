<script lang="ts">
  import classNames from "classnames";
  import ModalBackdrop from "../ui/ModalBackdrop.svelte";
  import Modal from "../ui/Modal.svelte";
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
    <span class="mr-1">{$draft ? "✍️" : "🔏"}</span>
    {$draft ? "Draft" : "Sealed document"}
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
