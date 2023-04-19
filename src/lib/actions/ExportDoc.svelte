<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { envelope } from "$lib/stores.js";
  import Modal from "$lib/ui/Modal.svelte";
  import ExportDocContent from "./ExportDocContent.svelte";
  import { actionButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import ModalBackdrop from "$lib/ui/ModalBackdrop.svelte";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import { CloudArrowDown, Icon } from "svelte-hero-icons";

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

<Tooltip label="Preview and download document" containerClass="block">
  <button on:click={handleClick} class={actionButtonClasses(!envelopeExists)}>
    <Icon src={CloudArrowDown} class="h-5 w-5" solid />
    Download PDF
  </button>
</Tooltip>
