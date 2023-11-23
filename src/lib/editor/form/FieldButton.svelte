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
  class="flex items-center justify-start w-full p-1 bg-white rounded-sm border border-neutral-200 {isDestructive
    ? 'hover:bg-danger-500 hover:text-white text-danger-500'
    : 'hover:bg-neutral-100 text-neutral-800'}"
>
  {#if isDestructive && needsConfirmation}
    <span class="text-xs mr-1">Sure?</span>
  {/if}
  <Icon src={buttonIcon} class="h-4 w-4" />
</button>
