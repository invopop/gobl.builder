<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Tooltip } from "flowbite-svelte";

  import { envelope } from "$lib/stores.js";
  import Modal from "$lib/ui/Modal.svelte";
  import ExportDocContent from "./ExportDocContent.svelte";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import ModalBackdrop from "$lib/ui/ModalBackdrop.svelte";

  const dispatch = createEventDispatcher();

  $: envelopeExists = Boolean($envelope);

  function handleClick() {
    if (!envelopeExists) {
      return;
    }

    const modal = new Modal({
      target: document.body,
      props: {
        title: "Export document",
        content: ExportDocContent,
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
    modal.$on("preview", (event) => dispatch("preview", event.detail));
    modal.$on("download", (event) => dispatch("download", event.detail));
  }
</script>

<Tooltip
  triggeredBy="#tooltip-export"
  tipClass="py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm transition-opacity duration-300"
>
  Preview and download document
</Tooltip>
<button id="tooltip-export" on:click={handleClick} class={iconButtonClasses(!envelopeExists)}>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path
      fill-rule="evenodd"
      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
      clip-rule="evenodd"
    />
  </svg>
</button>
