<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Tooltip } from "flowbite-svelte";

  import Modal from "$lib/ui/Modal.svelte";
  import ModalBackdrop from "$lib/ui/ModalBackdrop.svelte";
  import DocLoaderContent from "./DocLoaderContent.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  onMount(() => {
    document.addEventListener("docLoaded", handleDocLoaded as EventListener, true);
  });

  onDestroy(() => {
    document.removeEventListener("docLoaded", handleDocLoaded as EventListener, true);
  });

  function handleDocLoaded(event: CustomEvent<string>) {
    dispatch("load", event.detail);
  }

  function handleLoadClick() {
    const modal = new Modal({
      target: document.body,
      props: {
        title: "Load document",
        content: DocLoaderContent,
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

<Tooltip
  triggeredBy="#tooltip-load"
  tipClass="py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm transition-opacity duration-300"
>
  Load a GOBL document from a template, file upload or your library.
</Tooltip>
<button
  id="tooltip-load"
  class="font-medium text-white bg-sky-600 hover:bg-sky-500 text-xs px-4 py-2 rounded-md inline-flex items-center"
  on:click={handleLoadClick}
>
  <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 -ml-1 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path
      fill-rule="evenodd"
      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
      clip-rule="evenodd"
    />
  </svg>
  Load document…
</button>
