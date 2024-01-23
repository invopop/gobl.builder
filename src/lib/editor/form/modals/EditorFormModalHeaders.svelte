<script lang="ts">
  import Modal from "$lib/ui/Modal.svelte";
  import DynamicForm from "$lib/editor/form/DynamicForm.svelte";
  import { getUIModel, type UIModelField } from "$lib/editor/form/utils/model";
  import type { SchemaValue } from "$lib/editor/form/utils/schema";
  import { envelope } from "$lib/editor/stores.js";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let headerModel: UIModelField | undefined;

  $: if ($envelope) {
    generateHeadersModel($envelope.head as SchemaValue);
  }

  async function generateHeadersModel(schema: SchemaValue) {
    headerModel = await getUIModel("https://gobl.org/draft-0/head/header", schema);
  }

  function handleConfirm() {
    $envelope.head = JSON.parse(headerModel?.toJSON() as string);
    dispatch("close");
  }
</script>

<Modal title="Headers" on:close on:confirm={handleConfirm}>
  {#if headerModel}
    <DynamicForm modal model={headerModel} on:uiRefreshNeeded={(event) => (headerModel = event.detail)} />
  {/if}
</Modal>
