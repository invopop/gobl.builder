<script lang="ts">
  import { envelope } from "../stores";
  $: sigs = $envelope?.sigs;
</script>

{#if sigs}
  <pre class="text-sm text-sky-600">{JSON.stringify(sigs, null, 4)}</pre>
{/if}
