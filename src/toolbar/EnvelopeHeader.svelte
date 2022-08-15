<script lang="ts">
  import { envelope } from "../stores";
  $: head = $envelope?.head;
</script>

{#if head}
  <pre class="text-sm text-sky-600">{JSON.stringify(head, null, 4)}</pre>
{/if}
