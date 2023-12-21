<script lang="ts">
  import type { ListOption } from "$lib/types/ui";
  import { createEventDispatcher } from "svelte";
  import { Icon } from "svelte-hero-icons";
  import { Tick } from "@invopop/ui-icons";

  const dispatch = createEventDispatcher();

  export let isActive = false;
  export let option: ListOption;
  export let disabled = false;
</script>

<li class="navbar-item">
  <button
    {disabled}
    class:font-bold={isActive}
    class:opacity-30={disabled}
    class="flex items-center space-x-3"
    on:click={() => {
      dispatch("click", option);
    }}
  >
    <span>{option.label}</span>
    {#if isActive}
      <Icon src={Tick} class="h-5 w-5 text-positive-500" />
    {/if}
  </button>
</li>
