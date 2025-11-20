<script lang="ts">
  import DynamicForm from '$lib/editor/form/DynamicForm.svelte'
  import { getUIModel } from '$lib/editor/form/utils/model'
  import type { SchemaValue } from '$lib/editor/form/utils/schema'
  import { createBuilderContext } from './store/builder'
  import type { ObjectEditorProps } from './types/editor'

  let {
    jsonSchemaURL = '',
    data = undefined,
    id = `editor-${Math.random().toString(36).slice(2, 7)}`,
    readOnly = false,
    model = $bindable(undefined)
  }: ObjectEditorProps = $props()

  createBuilderContext()

  async function generateModel(schema: SchemaValue) {
    model = await getUIModel(jsonSchemaURL, schema, id)
  }

  export function getJson(): string {
    return model?.toJSON() as string
  }

  $effect(() => {
    if (!data) return
    generateModel(data as SchemaValue)
  })
</script>

{#if model}
  <DynamicForm {model} {readOnly} onUiRefreshNeeded={(m) => (model = m)} />
{/if}
