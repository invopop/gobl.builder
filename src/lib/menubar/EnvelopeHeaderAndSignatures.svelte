<script lang="ts">
  import { envelope } from "$lib/stores.js";
  import EnvelopeHeader from "./EnvelopeHeader.svelte";
  import EnvelopeSignatures from "./EnvelopeSignatures.svelte";

  $: head = Boolean($envelope?.head);
  $: sigs = Boolean($envelope?.sigs);
</script>

<div>
  <div class="my-2">
    <h2 class="font-bold">Headers</h2>
    <div class="p-2">
      <EnvelopeHeader />
    </div>
  </div>

  <div class="my-2">
    <h2 class="font-bold">Signatures</h2>
    <div class="p-2">
      {#if sigs}
        <EnvelopeSignatures />
      {:else}
        <p class="text-xs text-gray-500">There are no signatures. They are generated when signing a document</p>
      {/if}
    </div>
  </div>
</div>
