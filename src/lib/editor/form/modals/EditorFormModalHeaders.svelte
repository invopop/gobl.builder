<script lang="ts">
  import Modal from "$lib/ui/Modal.svelte";
  import { createEventDispatcher } from "svelte";
  import type { EnvelopeHeader } from "$lib/types/envelope";
  import ObjectEditor from "$lib/ObjectEditor.svelte";

  const dispatch = createEventDispatcher();

  interface Props {
    header?: EnvelopeHeader | null;
  }

  let { header = null }: Props = $props();

  let editor: ObjectEditor = $state();

  function handleConfirm() {
    const json = editor.getJson();
    dispatch("confirm", JSON.parse(json));
  }
</script>

<Modal title="Headers" on:close on:confirm={handleConfirm}>
  <ObjectEditor bind:this={editor} jsonSchemaURL="https://gobl.org/draft-0/head/header" data={header} id="header" />
</Modal>
