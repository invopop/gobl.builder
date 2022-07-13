<script lang="ts">
  import classNames from "classnames";
  import ModalBackdrop from "../ui/ModalBackdrop.svelte";
  import Modal from "../ui/Modal.svelte";
  import { draft, envelope } from "./stores";
  import EnvelopeHeader from "./EnvelopeHeader.svelte";

  $: headerButtonEnabled = Boolean($envelope);
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

<div class="flex items-center gap-2 bg-gray-200 px-4 py-2 text-xs shadow-inner">
  <div class="flex-1">
    <span class="mr-1">{$draft ? "✍️" : "🔏"}</span>
    {$draft ? "Draft" : "Sealed document"}
  </div>
  <div>
    <button
      class={classNames("px-3 py-1 rounded-full", {
        "text-white bg-slate-500": headerButtonEnabled,
        "cursor-not-allowed text-slate-500 bg-slate-300": !headerButtonEnabled,
      })}
      on:click={handleHeaderClick}
      disabled={!headerButtonEnabled}>View header</button
    >
  </div>
  <div>
    <button
      class={classNames("px-3 py-1 rounded-full", {
        "text-white bg-slate-500": signaturesButtonEnabled,
        "cursor-not-allowed text-slate-500 bg-slate-300": !signaturesButtonEnabled,
      })}
      disabled={!signaturesButtonEnabled}>View signatures</button
    >
  </div>
  <div>
    <button>...</button>
  </div>
</div>
