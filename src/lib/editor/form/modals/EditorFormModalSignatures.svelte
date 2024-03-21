<script lang="ts">
  import { getBuilderContext } from "$lib/store/builder";
  import Modal from "$lib/ui/Modal.svelte";

  const { envelope } = getBuilderContext();

  $: sigs = $envelope?.sigs;
</script>

<Modal title="Signatures" hideConfirmButton on:close>
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
      class="text-sm text-neutral-800 bg-neutral-50 border border-neutral-100 outline-none mx-4"
    >
      {JSON.stringify(sigs, null, 4)}
    </div>
  {/if}
</Modal>
