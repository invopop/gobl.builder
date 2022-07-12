<script lang="ts">
  import { envelope } from "./stores";
  $: head = $envelope?.head;
</script>

{#if head}
  <pre>{JSON.stringify(head, null, 4)}</pre>
{/if}
