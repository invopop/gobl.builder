<script lang="ts">
  import { editorJSON } from "$lib/stores.js";
  import { getParsedSchemaRegistry, getUIModel, type UIModelField } from "$lib/schema.js";
  import AbstractField from "./AbstractField.svelte";

  export let jsonSchemaURL: string;

  let buildUISchema: UIModelField | undefined;

  async function loadSchema(schema: string, instance: JSON) {
    buildUISchema = await getUIModel({
      schema,
      instance,
    });
  }

  $: loadSchema(jsonSchemaURL, $editorJSON);
  $: {
    console.log(getParsedSchemaRegistry(), jsonSchemaURL);
  }
</script>

<div class="h-full px-6 py-4 text-xs overflow-scroll">
  {#if buildUISchema}
    <AbstractField field={buildUISchema} />
  {/if}

  <br />

  ----
  <br />

  <!-- <NewBlockButtons /> -->
  <pre>
    {JSON.stringify(buildUISchema, null, 2)}
  </pre>
  ----
  <pre>
    {JSON.stringify($editorJSON, null, 2)}
  </pre>
</div>
