<script lang="ts">
  import DynamicForm from "$lib/editor/form/DynamicForm.svelte";
  import { getUIModel, type UIModelField } from "$lib/editor/form/utils/model";
  import type { SchemaValue } from "$lib/editor/form/utils/schema";
  import { createBuilderContext } from "./store/builder";

  export let jsonSchemaURL = "";
  export let data: unknown;
  export let id = `editor-${Math.random().toString(36).slice(2, 7)}`;

  let model: UIModelField | undefined;

  createBuilderContext();

  $: if (data) {
    generateModel(data as SchemaValue);
  }

  async function generateModel(schema: SchemaValue) {
    model = await getUIModel(jsonSchemaURL, schema, id);
  }

  export function getJson(): string {
    return model?.toJSON() as string;
  }
</script>

{#if model}
  <DynamicForm {model} on:uiRefreshNeeded={(event) => (model = event.detail)} />
{/if}
