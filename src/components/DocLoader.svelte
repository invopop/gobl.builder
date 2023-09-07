<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import Modal from "$lib/ui/Modal.svelte";
  import DocLoaderContent from "./DocLoaderContent.svelte";
  import { createEventDispatcher } from "svelte";
  import Tooltip from "$lib/ui/Tooltip.svelte";

  const dispatch = createEventDispatcher();

  let openModal = false;

  onMount(() => {
    // eslint-disable-next-line no-undef
    document.addEventListener("docLoaded", handleDocLoaded as EventListener, true);
  });

  onDestroy(() => {
    // eslint-disable-next-line no-undef
    document.removeEventListener("docLoaded", handleDocLoaded as EventListener, true);
  });

  function handleDocLoaded(event: CustomEvent<string>): void {
    dispatch("load", event.detail);
  }
</script>

<Tooltip label="Load a GOBL document from a template, file upload or your library.">
  <button
    class="font-medium text-white bg-sky-600 hover:bg-sky-500 text-xs px-4 py-2 rounded-md inline-flex items-center"
    on:click={() => (openModal = true)}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="mr-2 -ml-1 w-4 h-4"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
      />
    </svg>

    Load document…
  </button>
</Tooltip>
{#if openModal}
  <div>
    <div class="bg-black bg-opacity-70 fixed inset-0 z-40" />
    <Modal title="Load document" on:close={() => (openModal = false)}>
      <DocLoaderContent on:close={() => (openModal = false)} />
    </Modal>
  </div>
{/if}
