<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { SvelteComponent } from "svelte";

  import { envelope } from "$lib/editor/stores.js";
  import Modal from "$lib/ui/Modal.svelte";
  import ExportDocContent from "./ExportDocContent.svelte";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import ModalBackdrop from "$lib/ui/ModalBackdrop.svelte";
  import Tooltip from "$lib/ui/Tooltip.svelte";

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
        content: ExportDocContent as typeof SvelteComponent,
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

<Tooltip label="Preview and download document">
  <button on:click={handleClick} class={iconButtonClasses(!envelopeExists)}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
</Tooltip>
