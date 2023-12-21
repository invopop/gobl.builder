<script lang="ts">
  import { Modal } from "flowbite-svelte";
  import DocLoaderContent from "./DocLoaderContent.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let openModal = false;

  function handleDocLoaded(event: CustomEvent<string>): void {
    dispatch("load", event.detail);
  }
</script>

<button
  title="Load a GOBL document from a template, file upload or your library."
  class="navbar-item"
  on:click={() => {
    openModal = true;
  }}>Load Document</button
>
{#if openModal}
  <Modal outsideclose size="xs" title="Load Document Template" bind:open={openModal} autoclose>
    <DocLoaderContent on:close={() => (openModal = false)} on:docLoaded={handleDocLoaded} />
  </Modal>
{/if}
