<script lang="ts">
  import { onMount } from "svelte";
  import * as GOBL from "./lib/gobl";

  let keypair: Awaited<ReturnType<typeof GOBL.keygen>>;

  $: keypairJSON = JSON.stringify(keypair, null, 2);

  onMount(async () => {
    keypair = await GOBL.keygen();
  });
</script>

{#if !keypair}
  <p>Loading ...</p>
{:else}
  <pre>{keypairJSON}</pre>
{/if}
