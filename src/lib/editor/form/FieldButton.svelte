<script lang="ts">
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import { Icon, type IconSource } from "svelte-hero-icons";

  export let icon: IconSource;
  export let tooltipText = "";
  export let isDestructive = false;
</script>

<Tooltip>
  <svelte:fragment slot="content">
    <p class="whitespace-nowrap">{tooltipText}</p>
  </svelte:fragment>
  <button
    on:click
    class="flex items-center justify-start w-full p-2 {isDestructive
      ? 'hover:bg-red-400 hover:text-white'
      : 'hover:bg-gray-200'}"
  >
    <Icon src={icon} class="h-4 w-4 p-0.5" />
  </button>
</Tooltip>
