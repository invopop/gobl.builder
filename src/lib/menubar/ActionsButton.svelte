<script lang="ts">
  import ClearEditor from "$lib/actions/ClearEditor.svelte";
  import ExportDoc from "$lib/actions/ExportDoc.svelte";
  import Sign from "$lib/actions/Sign.svelte";
  import Validate from "$lib/actions/Validate.svelte";
  import { Icon, ChevronDown } from "svelte-hero-icons";
  import { fade } from "svelte/transition";

  export let jsonSchemaURL: string;
  export let signEnabled: boolean;

  let showActions = false;

  function handleToggleActions() {
    showActions = !showActions;
  }
</script>

<div class="relative">
  <button class="text-xs flex items-center gap-2 " on:click={handleToggleActions}>
    Actions
    <Icon src={ChevronDown} class="h-4 w-4 p-0.5 text-gray-400" />
  </button>
  {#if showActions}
    <div class="absolute top-full mt-4 -left-4 z-10 w-48" transition:fade={{ duration: 200 }}>
      <ul
        class="flex flex-col gap-2 list-none bg-white border border-slate-200 rounded overflow-hidden py-2 shadow-md"
        role="menu"
      >
        {#if signEnabled}
          <li>
            <Sign {jsonSchemaURL} on:sign />
          </li>
        {/if}
        <li>
          <Validate {jsonSchemaURL} on:validate />
        </li>
        <li>
          <ExportDoc on:preview on:download />
        </li>
        <li>
          <div class="border-b border-b-gray-200 mx-4" />
        </li>
        <li>
          <ClearEditor on:clear />
        </li>
      </ul>
    </div>
  {/if}
</div>
