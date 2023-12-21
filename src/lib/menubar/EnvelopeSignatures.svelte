<script lang="ts">
  import { envelope } from "$lib/editor/stores.js";
  $: sigs = $envelope?.sigs;
</script>

{#if sigs}
  <pre class="text-sm text-neutral-800 bg-neutral-50 border border-neutral-100">{JSON.stringify(sigs, null, 4)}</pre>
{/if}
