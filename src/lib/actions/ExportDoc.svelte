<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { envelope } from "$lib/editor/stores.js";
  import Modal from "$lib/ui/Modal.svelte";
  import ExportDocContent from "./ExportDocContent.svelte";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";

  const dispatch = createEventDispatcher();

  let openModal = false;

  $: envelopeExists = Boolean($envelope);

  function handleClick() {
    if (!envelopeExists) {
      return;
    }

    openModal = true;
  }
</script>

<button title="Preview and download document" on:click={handleClick} class={iconButtonClasses(!envelopeExists)}>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path
      fill-rule="evenodd"
      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
      clip-rule="evenodd"
    />
  </svg>
</button>
{#if openModal}
  <div>
    <div class="bg-black bg-opacity-70 fixed inset-0 z-40" />
    <Modal title="Export document" on:close={() => (openModal = false)}>
      <ExportDocContent
        on:download={(event) => dispatch("download", event.detail)}
        on:preview={(event) => dispatch("preview", event.detail)}
      />
    </Modal>
  </div>
{/if}
