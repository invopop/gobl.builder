<script lang="ts">
  import Modal from '$lib/ui/Modal.svelte'
  import ObjectEditor from '$lib/ObjectEditor.svelte'
  import type { EditorFormModalCorrectProps } from '$lib/types/editor'

  let { model, onConfirm, onclose }: EditorFormModalCorrectProps = $props()

  let editor: ObjectEditor | undefined = $state()

  function handleConfirm() {
    onConfirm?.(editor?.getJson() || '')
  }
</script>

<Modal title="Correct" {onclose} onConfirm={handleConfirm}>
  <ObjectEditor bind:this={editor} {model} id="correct" />
</Modal>
