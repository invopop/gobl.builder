<script lang="ts">
  import { envelope } from "$lib/stores.js";
  $: sigs = $envelope?.sigs;
</script>

{#if sigs}
  <pre class="text-sm text-sky-600 dark:text-sky-400">{JSON.stringify(sigs, null, 4)}</pre>
{/if}
