<script lang="ts">
  import type { EditorProblem } from '$lib/editor/EditorProblem.js'
  import EnvelopeEditor from '$lib/EnvelopeEditor.svelte'
  import type { ActionMethod, State } from '$lib/types/editor'
  import BuilderNavbar from '../components/BuilderNavbar.svelte'
  import type { EnvelopeHeader, GOBLDocument } from '$lib/types/envelope'
  import EditorFormModalSignatures from '$lib/editor/form/modals/EditorFormModalSignatures.svelte'
  import EditorFormModalHeaders from '$lib/editor/form/modals/EditorFormModalHeaders.svelte'
  import EditorFormModalCorrect from '$lib/editor/form/modals/EditorFormModalCorrect.svelte'
  import type { UIModelField } from '$lib/editor/form/utils/model'
  import { toast } from 'svelte-sonner'

  let data = $state('')
  let problems: EditorProblem[] = $state([])
  let jsonSchemaURL = $state('')
  let defaultSchema = $state('')
  let builder: EnvelopeEditor | undefined = $state()
  let initialState: State = $state('init')
  let forceReadOnly = $state(false)
  let envelope = ''
  let editorView = $state('code')
  let openSignaturesModal = $state(false)
  let sigs: string[] | null = $state(null)
  let openHeadersModal = $state(false)
  let header: EnvelopeHeader | null = $state(null)
  let openCorrectModal = $state(false)
  let correctionModel: UIModelField | undefined = $state()

  function handleDocLoad(doc: GOBLDocument) {
    const newData = JSON.stringify(doc, null, 4)
    data = newData

    // Hack for allowing load the same document again to restore data
    if (newData === data) {
      builder?.reloadData()
    }

    jsonSchemaURL = doc.$schema
    defaultSchema = jsonSchemaURL.replace('https://gobl.org/draft-0/', '')
  }

  function handleSchemaChange(schema: string) {
    jsonSchemaURL = schema
  }

  async function handleAction(action: ActionMethod) {
    if (action === 'showSignatures') {
      sigs = (await builder?.getSignatures()) || null
      openSignaturesModal = true
      return
    }

    if (action === 'showHeaders') {
      header = (await builder?.getHeaders()) || null
      openHeadersModal = true
      return
    }

    if (action === 'correct') {
      correctionModel = await builder?.getCorrectionOptionsModel()
      openCorrectModal = true
      return
    }

    builder?.[action]()
  }
</script>

<div class="flex flex-col h-screen bg-gobl-900">
  <BuilderNavbar
    {initialState}
    {defaultSchema}
    {envelope}
    bind:forceReadOnly
    bind:editorView
    onLoad={handleDocLoad}
    onAction={(action) => handleAction(action as ActionMethod)}
    onSchemaChanged={handleSchemaChange}
  />
  <div class="flex-1 h-full p-1 pt-14">
    <div class="h-full bg-background rounded-t-lg">
      <EnvelopeEditor
        bind:this={builder}
        bind:state={initialState}
        bind:data
        bind:problems
        {jsonSchemaURL}
        {editorView}
        signEnabled
        bind:forceReadOnly
        onChange={(envelope) => {
          console.log('Received change event.', envelope)
        }}
        onBuild={(result) => {
          console.log('Received build result.', result)
        }}
        onSign={(result) => {
          console.log('Received sign result.', result)
        }}
        onValidate={(result) => {
          console.log('Received validate result.', result)
        }}
        onCorrect={(result) => {
          console.log('Received correct result.', result)
        }}
        onNotification={(notification) => {
          switch (notification.type) {
            case 'info':
              toast.info(notification.message)
              break
            case 'success':
              toast.success(notification.message)
              break
            case 'error':
              toast.error(notification.message)
              break
          }
        }}
      />
    </div>
  </div>
</div>
{#if openSignaturesModal}
  <EditorFormModalSignatures
    {sigs}
    onclose={() => {
      openSignaturesModal = false
      sigs = null
    }}
  />
{/if}

{#if openHeadersModal}
  <EditorFormModalHeaders
    {header}
    onclose={() => {
      openHeadersModal = false
      header = null
    }}
    onConfirm={(value) => {
      builder?.setHeaders(value)
      openHeadersModal = false
    }}
  />
{/if}

{#if openCorrectModal}
  <EditorFormModalCorrect
    model={correctionModel}
    onclose={() => {
      openCorrectModal = false
    }}
    onConfirm={async (value) => {
      const result = await builder?.correctWithOptions(value)
      openCorrectModal = !result
    }}
  />
{/if}
