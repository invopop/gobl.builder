<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { envelope, envelopeIsSigned } from "./editor/stores";
  import { Icon } from "@steeze-ui/svelte-icon";
  import { Header, Signature } from "@invopop/ui-icons";

  const dispatch = createEventDispatcher();
</script>

{#if $envelope?.doc}
  <button
    title="Show document headers"
    class="inline-flex items-center space-x-1.5 p-1.5 border border-neutral-300 text-sm font-medium text-white hover:text-cyan-500 hover:border-cyan-500"
    on:click={() => {
      dispatch("action", "showHeaders");
    }}
  >
    <Icon src={Header} class="h-5 w-5" />
  </button>
  {#if $envelopeIsSigned}
    <button
      title="Show document signatures"
      class="inline-flex items-center space-x-1.5 p-1.5 border border-neutral-300 text-sm font-medium text-white hover:text-cyan-500 hover:border-cyan-500"
      on:click={() => {
        dispatch("action", "showSignatures");
      }}
    >
      <Icon src={Signature} class="h-5 w-5" />
    </button>
  {/if}
{/if}
