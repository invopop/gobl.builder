<script lang="ts">
  import { envelope } from "$lib/stores.js";
  $: head = $envelope?.head;
</script>

{#if head}
  <pre class="text-xs text-sky-600">{JSON.stringify(head, null, 4)}</pre>
{/if}
