<script lang="ts">
  import { envelope } from "$lib/stores.js";
  $: head = $envelope?.head;
</script>

{#if head}
  <pre class="text-sm text-sky-600 dark:text-sky-400">{JSON.stringify(head, null, 4)}</pre>
{/if}
