<script lang="ts">
  import { envelope } from "$lib/editor/stores.js";
  $: head = $envelope?.head;
</script>

{#if head}
  <pre class="text-sm text-neutral-800 bg-neutral-50 border border-neutral-100">{JSON.stringify(head, null, 4)}</pre>
{/if}
