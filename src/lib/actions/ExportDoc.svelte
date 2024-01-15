<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { envelope } from "$lib/editor/stores.js";
  import Modal from "$lib/ui/Modal.svelte";
  import ExportDocContent from "./ExportDocContent.svelte";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import { Icon } from "@steeze-ui/svelte-icon";
  import { Download } from "@invopop/ui-icons";

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
  <Icon src={Download} class="w-5 h-5" />
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
