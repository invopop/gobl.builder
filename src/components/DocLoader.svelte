<script lang="ts">
  import { Modal } from "flowbite-svelte";
  import DocLoaderContent from "./DocLoaderContent.svelte";
  import { createEventDispatcher } from "svelte";
  import { Icon } from "@steeze-ui/svelte-icon";
  import { Folder } from "@invopop/ui-icons";

  const dispatch = createEventDispatcher();

  let openModal = false;

  function handleDocLoaded(event: CustomEvent<string>): void {
    dispatch("load", event.detail);
  }
</script>

<button
  title="Load a GOBL document from a template, file upload or your library."
  class="border border-cyan-500 py-[5px] pl-2 pr-3 text-cyan-500 rounded text-base font-medium flex items-center space-x-1"
  on:click={() => {
    openModal = true;
  }}
>
  <Icon src={Folder} class="h-5 w-5" />
  <span>Load</span>
</button>
{#if openModal}
  <Modal outsideclose size="xs" title="Load Document Template" bind:open={openModal} autoclose>
    <DocLoaderContent on:close={() => (openModal = false)} on:docLoaded={handleDocLoaded} />
  </Modal>
{/if}
