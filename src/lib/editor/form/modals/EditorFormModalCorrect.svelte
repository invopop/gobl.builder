<script lang="ts">
  import Modal from "$lib/ui/Modal.svelte";
  import { Edit } from "@invopop/ui-icons";
  import DynamicForm from "../DynamicForm.svelte";
  import type { UIModelField } from "../utils/model";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let correctionModel: UIModelField | undefined;
</script>

<Modal
  title="Correct"
  confirmButtonIcon={Edit}
  confirmButtonText="Correct"
  on:close
  on:confirm={() => dispatch("correct")}
>
  <DynamicForm model={correctionModel} on:uiRefreshNeeded={(event) => (correctionModel = event.detail)} />
</Modal>
