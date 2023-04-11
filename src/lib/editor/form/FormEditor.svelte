<script lang="ts">
  import RootField from "./RootField.svelte";
  import { createFormEditorContext, getFormEditorContext } from "./context/formEditor.js";
  import { writable } from "svelte/store";

  export let jsonSchemaURL: string;

  let schemaURLStore = writable(jsonSchemaURL);
  $: schemaURLStore.set(jsonSchemaURL);

  createFormEditorContext(schemaURLStore);

  const { uiModel } = getFormEditorContext() || {};
</script>

<div class="h-full overflow-scroll">
  <div class="flex justify-center px-16 py-8 pb-40 text-sm">
    <div class="w-full max-w-2xl bg-gray-100 p-6 rounded">
      {#if $uiModel}
        <RootField field={$uiModel} />
      {/if}

      <!-- <br />

  ----
  <br />

  <pre>
    {JSON.stringify(buildUISchema, null, 2)}
  </pre>

  ----

  <pre>
    {JSON.stringify($editorJSON, null, 2)}
  </pre> -->
    </div>
  </div>
</div>
