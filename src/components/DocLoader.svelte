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
  class="border border-gobl-50 py-[5px] pl-2 pr-3 text-gobl-50 rounded text-base font-medium flex items-center space-x-1"
  on:click={() => {
    openModal = true;
  }}
>
  <Icon src={Folder} class="h-5 w-5" />
  <span>Load</span>
</button>
{#if openModal}
  <Modal
    backdropClass="fixed inset-0 z-40 bg-neutral-800/80"
    bodyClass="px-6 pt-0"
    outsideclose
    dismissable={false}
    size="xs"
    bind:open={openModal}
    autoclose
  >
    <div slot="header" class="p-2">
      <p class="font-semibold text-3xl text-neutral-800">Load Template</p>
    </div>
    <DocLoaderContent on:close={() => (openModal = false)} on:docLoaded={handleDocLoaded} />
  </Modal>
{/if}
