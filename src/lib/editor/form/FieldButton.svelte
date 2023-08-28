<script lang="ts">
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import { createEventDispatcher } from "svelte";
  import { Icon, type IconSource } from "svelte-hero-icons";

  export let icon: IconSource;
  export let confirmationIcon: IconSource | null = null;
  export let tooltipText = "";
  export let isDestructive = false;

  let needsConfirmation = false;

  $: buttonIcon = !isDestructive ? icon : needsConfirmation ? confirmationIcon : icon;

  const dispatch = createEventDispatcher();

  const handleClick = () => {
    if (isDestructive && !needsConfirmation) {
      needsConfirmation = true;
      setTimeout(() => {
        needsConfirmation = false;
      }, 3000);
      return;
    }

    needsConfirmation = false;

    dispatch("click");
  };
</script>

<Tooltip>
  <svelte:fragment slot="content">
    <p class="whitespace-nowrap">{tooltipText}</p>
  </svelte:fragment>
  <button
    on:click={handleClick}
    class="flex items-center justify-start w-full p-2 {isDestructive
      ? 'hover:bg-red-400 hover:text-white'
      : 'hover:bg-gray-200'}"
  >
    <Icon src={buttonIcon} class="h-4 w-4 p-0.5" />
  </button>
</Tooltip>
