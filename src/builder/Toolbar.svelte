<script lang="ts">
  import classNames from "classnames";
  import ModalBackdrop from "../ui/ModalBackdrop.svelte";
  import Modal from "../ui/Modal.svelte";
  import { draft, envelope } from "./stores";
  import EnvelopeHeader from "./EnvelopeHeader.svelte";

  $: headerButtonEnabled = Boolean($envelope);
  let signaturesButtonEnabled = false;

  function handleHeaderClick() {
    if (!headerButtonEnabled) {
      return;
    }

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

<div class="flex items-center gap-2 bg-gray-200 px-4 py-2 text-xs shadow-inner">
  <div class="flex-1">
    <span class="mr-1">{$draft ? "✍️" : "🔏"}</span>
    {$draft ? "Draft" : "Sealed document"}
  </div>
  <div>
    <div
      id="tooltip-header"
      role="tooltip"
      class="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip dark:bg-gray-700"
    >
      {#if headerButtonEnabled}
        View the header of the built document.
      {:else}
        There is no document header yet. Please use "Build" first.
      {/if}
      <div class="tooltip-arrow" data-popper-arrow />
    </div>
    <button
      data-tooltip-target="tooltip-header"
      class={classNames("px-3 py-1 rounded-full", {
        "text-white bg-slate-500": headerButtonEnabled,
        "cursor-not-allowed text-slate-500 bg-slate-300": !headerButtonEnabled,
      })}
      on:click={handleHeaderClick}>View header</button
    >
  </div>
  <div>
    <div
      id="tooltip-signatures"
      role="tooltip"
      class="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip dark:bg-gray-700"
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
      class={classNames("px-3 py-1 rounded-full", {
        "text-white bg-slate-500": signaturesButtonEnabled,
        "cursor-not-allowed text-slate-500 bg-slate-300": !signaturesButtonEnabled,
      })}>View signatures</button
    >
  </div>
  <div>
    <button>...</button>
  </div>
</div>
