<script lang="ts">
  import { editor } from "./stores";
  import Modal from "../ui/Modal.svelte";
  import ModalBackdrop from "../ui/ModalBackdrop.svelte";
  import DocLoaderContent from "./DocLoaderContent.svelte";

  $: editorIsEmpty = !Boolean($editor);

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

{#if editorIsEmpty}
  <div
    id="tooltip-load"
    role="tooltip"
    class="inline-block absolute invisible z-10 py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
  >
    Load a GOBL document from a template, file upload or your library.
    <div class="tooltip-arrow" data-popper-arrow />
  </div>
  <button
    class="font-medium border hover:bg-gray-100 text-sm px-4 py-2 rounded-lg inline-flex"
    on:click={handleLoadClick}
    data-tooltip-target="tooltip-load"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 -ml-1 w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
        clip-rule="evenodd"
      />
    </svg>
    Load document…</button
  >
{/if}
