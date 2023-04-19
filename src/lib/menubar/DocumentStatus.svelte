<script lang="ts">
  import ModalBackdrop from "$lib/ui/ModalBackdrop.svelte";
  import Modal from "$lib/ui/Modal.svelte";
  import EnvelopeHeaderAndSignatures from "./EnvelopeHeaderAndSignatures.svelte";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import { envelopeIsDraft, envelopeIsSigned } from "$lib/stores.js";

  function handleHeaderClick() {
    const target = document.body;

    const backdrop = new ModalBackdrop({ target });
    const modal = new Modal({
      target,
      props: {
        title: "Header and Signatures",
        content: EnvelopeHeaderAndSignatures,
      },
    });

    function handleClose() {
      modal.$destroy();
      backdrop.$destroy();
    }

    modal.$on("close", handleClose);
  }
</script>

<div class="flex gap-2">
  {#if $envelopeIsDraft}
    <Tooltip label="View the header and signatures of the built document">
      <span on:click={handleHeaderClick} class="flex items-center gap-2 cursor-pointer hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
          <path
            fill-rule="evenodd"
            d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
            clip-rule="evenodd"
          />
        </svg>
        <span>Draft</span>
      </span>
    </Tooltip>
  {:else if $envelopeIsSigned}
    <Tooltip label="View the header and signatures of the built document">
      <span on:click={handleHeaderClick} class="flex items-center gap-2 cursor-pointer hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clip-rule="evenodd"
          />
        </svg>
        <span>Signed document</span>
      </span>
    </Tooltip>
  {:else}
    <Tooltip label="Use the build button after finishing to build the document">
      <span class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
          <path
            fill-rule="evenodd"
            d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
            clip-rule="evenodd"
          />
        </svg>
        <span>Editing...</span>
      </span>
    </Tooltip>
  {/if}
</div>
