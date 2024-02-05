<script lang="ts">
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

<button
  title={tooltipText}
  on:click={handleClick}
  class="flex items-center justify-start w-full h-6 px-[4px] py-[3px] bg-white rounded {isDestructive
    ? 'hover:bg-danger-500 hover:text-white text-danger-500'
    : 'hover:bg-neutral-100 text-neutral-800'}"
>
  <Icon src={buttonIcon} class="h-4 w-4" />
  {#if isDestructive && needsConfirmation}
    <span class="text-sm ml-1">Sure?</span>
  {/if}
</button>
