<script lang="ts">
  import Modal from "$lib/ui/Modal.svelte";
  import type { UIModelField } from "../utils/model";
  import { createEventDispatcher } from "svelte";
  import ObjectEditor from "$lib/ObjectEditor.svelte";

  const dispatch = createEventDispatcher();

  export let model: UIModelField | undefined;

  let editor: ObjectEditor;

  function handleConfirm() {
    dispatch("confirm", editor.getJson());
  }
</script>

<Modal title="Correct" on:close on:confirm={handleConfirm}>
  <ObjectEditor bind:this={editor} {model} id="correct" />
</Modal>
