<script lang="ts">
  import { envelope } from "$lib/editor/stores.js";
  $: sigs = $envelope?.sigs;
</script>

{#if sigs}
  <div
    role="presentation"
    contenteditable
    on:keydown={(event) => {
      // Allow copy
      if (!event.metaKey) {
        event.preventDefault();
      }
    }}
    class="text-sm text-neutral-800 bg-neutral-50 border border-neutral-100 outline-none"
  >
    {JSON.stringify(sigs, null, 4)}
  </div>
{/if}
