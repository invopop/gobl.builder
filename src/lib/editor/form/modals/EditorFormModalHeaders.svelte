<script lang="ts">
  import Modal from '$lib/ui/Modal.svelte'
  import ObjectEditor from '$lib/ObjectEditor.svelte'
  import type { EditorFormModalHeadersProps } from '$lib/types/editor'

  let { header = null, onclose, onConfirm }: EditorFormModalHeadersProps = $props()

  let editor: ObjectEditor | undefined = $state()

  function handleConfirm() {
    const json = editor?.getJson() || ''
    onConfirm?.(JSON.parse(json))
  }
</script>

<Modal title="Headers" {onclose} onConfirm={handleConfirm}>
  <ObjectEditor
    bind:this={editor}
    jsonSchemaURL="https://gobl.org/draft-0/head/header"
    data={header}
    id="header"
  />
</Modal>
