<script lang="ts">
  import type { EditorFormModalSignaturesProps } from '$lib/types/editor'
  import Modal from '$lib/ui/Modal.svelte'

  let { sigs = null, onclose }: EditorFormModalSignaturesProps = $props()
</script>

<Modal title="Signatures" hideConfirmButton {onclose}>
  {#if sigs}
    <div
      role="presentation"
      contenteditable
      onkeydown={(event) => {
        // Allow copy
        if (!event.metaKey) {
          event.preventDefault()
        }
      }}
      class="text-sm text-foreground-inverse bg-background-default-secondary border border-border outline-none mx-4"
    >
      {JSON.stringify(sigs, null, 4)}
    </div>
  {/if}
</Modal>
