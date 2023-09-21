<script lang="ts">
  import SchemaField from "./SchemaField.svelte";
  import AbstractField from "./AbstractField.svelte";
  import type { UIModelRootField, UIModelField } from "./utils/model";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let showSchemaField = false;
  export let isEmptySchema = false;
  export let model: UIModelRootField | UIModelField | undefined = undefined;
</script>

<div class="h-full overflow-y-auto overflow-x-hidden bg-color1">
  <div class="flex justify-center px-16 py-8 pb-40 text-sm">
    <div class="w-full max-w-[536px]">
      {#if showSchemaField}
        <SchemaField {isEmptySchema} />
      {:else if model}
        <AbstractField
          field={model}
          on:fieldAdded={(event) => {
            dispatch("uiRefreshNeeded", model);
            dispatch("fieldAdded", event);
          }}
          on:fieldDeleted={(event) => {
            dispatch("uiRefreshNeeded", model);
            dispatch("fieldDeleted", event);
          }}
          on:fieldDuplicated={(event) => {
            dispatch("uiRefreshNeeded", model);
            dispatch("fieldDuplicated", event);
          }}
          on:fieldMoved={(event) => {
            dispatch("uiRefreshNeeded", model);
            dispatch("fieldMoved", event);
          }}
          on:fieldValueUpdated
          on:fieldKeyUpdated
        />
      {/if}
    </div>
  </div>
</div>