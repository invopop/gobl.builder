<script lang="ts">
  import ModalBackdrop from "$lib/ui/ModalBackdrop.svelte";
  import Modal from "$lib/ui/Modal.svelte";
  import EnvelopeHeaderAndSignatures from "./EnvelopeHeaderAndSignatures.svelte";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import { envelopeIsDraft, envelopeIsSigned } from "$lib/stores.js";
  import clickOutside from "$lib/clickOutside.js";
  import { fade } from "svelte/transition";
  import { actionButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import { ChevronDown, ChevronRight, Icon } from "svelte-hero-icons";

  function handleHeaderClick() {
    const target = document.body;

    const backdrop = new ModalBackdrop({ target });
    const modal = new Modal({
      target,
      props: {
        title: "Header and Signatures",
        content: EnvelopeHeaderAndSignatures as any,
      },
    });

    function handleClose() {
      modal.$destroy();
      backdrop.$destroy();
    }

    modal.$on("close", handleClose);
  }

  let showOptions = false;

  function handleToggleOptions() {
    showOptions = !showOptions;
  }

  function handleClickOutside() {
    showOptions = false;
  }
</script>

<div class="flex gap-2 relative" on:click={handleToggleOptions}>
  <span class="cursor-pointer text-grey-4 p-2 pr-1 rounded hover:bg-gray-200">
    {#if $envelopeIsDraft}
      <Tooltip label="View the header and signatures of the built document">
        <span class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path
              fill-rule="evenodd"
              d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Draft</span>
          <Icon src={ChevronDown} class="h-4 w-4 p-0.5 text-grey-4" />
        </span>
      </Tooltip>
    {:else if $envelopeIsSigned}
      <Tooltip label="View the header and signatures of the built document">
        <span class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Signed document</span>
          <Icon src={ChevronDown} class="h-4 w-4 p-0.5 text-grey-4" />
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
          <Icon src={ChevronDown} class="h-4 w-4 p-0.5 text-grey-4" />
        </span>
      </Tooltip>
    {/if}
  </span>

  {#if showOptions}
    <div
      class="absolute top-full left-0 mt-2 z-10 w-48"
      transition:fade={{ duration: 200 }}
      use:clickOutside
      on:clickOutside={handleClickOutside}
    >
      <ul
        class="flex flex-col gap-2 list-none bg-white border border-grey-1 rounded overflow-hidden py-2 shadow-md"
        role="menu"
      >
        <li>
          <Tooltip label="View signature" containerClass="block">
            <button on:click={handleHeaderClick} class={actionButtonClasses(false) + " flex justify-between"}>
              View Signature
              <Icon src={ChevronRight} class="h-2.5 w-2.5" solid />
            </button>
          </Tooltip>
        </li>
        <li>
          <Tooltip label="View signature" containerClass="block">
            <button on:click={handleHeaderClick} class={actionButtonClasses(false) + " flex justify-between"}>
              View Header
              <Icon src={ChevronRight} class="h-2.5 w-2.5" solid />
            </button>
          </Tooltip>
        </li>
      </ul>
    </div>
  {/if}
</div>
