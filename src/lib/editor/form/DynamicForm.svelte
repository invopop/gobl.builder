<script lang="ts">
  import SchemaField from "./SchemaField.svelte";
  import AbstractField from "./AbstractField.svelte";
  import type { UIModelRootField, UIModelField } from "./utils/model";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let showSchemaField = false;
  export let isEmptySchema = false;
  export let model: UIModelRootField | UIModelField | undefined = undefined;

  function handleFieldAdded() {
    dispatch("updated", model);
  }
</script>

<div class="h-full overflow-y-auto overflow-x-hidden bg-color1">
  <div class="flex justify-center px-16 py-8 pb-40 text-sm">
    <div class="w-full max-w-[536px]">
      {#if showSchemaField}
        <SchemaField {isEmptySchema} />
      {:else if model}
        <AbstractField field={model} on:fieldAdded={handleFieldAdded} />
      {/if}
    </div>
  </div>
</div>
