<script lang="ts">
  import DynamicForm from '$lib/editor/form/DynamicForm.svelte'
  import { getUIModel } from '$lib/editor/form/utils/model'
  import type { SchemaValue } from '$lib/editor/form/utils/schema'
  import { setApiBaseUrl, DEFAULT_API_BASE_URL } from '$lib/gobl/client'
  import { createBuilderContext } from './store/builder'
  import type { ObjectEditorProps } from './types/editor'

  let {
    jsonSchemaURL = '',
    apiBaseUrl = DEFAULT_API_BASE_URL,
    data = undefined,
    id = `editor-${Math.random().toString(36).slice(2, 7)}`,
    readOnly = false,
    model = $bindable(undefined)
  }: ObjectEditorProps = $props()

  // Configure the GOBL API endpoint before any schema is fetched. The initial
  // value is applied eagerly during init; the effect keeps it in sync.
  // svelte-ignore state_referenced_locally
  setApiBaseUrl(apiBaseUrl)
  $effect(() => {
    setApiBaseUrl(apiBaseUrl)
  })

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
