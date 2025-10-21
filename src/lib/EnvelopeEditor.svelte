<script lang="ts">
  import * as GOBL from '@invopop/gobl-worker'
  import hash from 'object-hash'
  import { envelopeDocumentJSON } from '$lib/helpers/envelope'
  import EditorCode from './editor/code/EditorCode.svelte'
  import EditorForm from './editor/form/EditorForm.svelte'
  import { isEnvelope } from '@invopop/gobl-worker'
  import { problemSeverityMap } from './editor/EditorProblem.js'
  import * as actions from './editor/actions'
  import type { BuildOptions, DocumentHeader, State } from './types/editor'
  import { displayAllErrors } from './helpers'
  import { generateCorrectOptionsModel } from './editor/form/utils/model'
  import fileSaver from 'file-saver'
  import type { Envelope, EnvelopeHeader } from './types/envelope'
  import { newEnvelope } from './helpers/envelope'
  import { createBuilderContext } from './store/builder'
  import type { EnvelopeEditorProps } from './types/editor.js'
  import { untrack } from 'svelte'

  let {
    jsonSchemaURL = '',
    data = $bindable(''),
    state: initialState = $bindable('init'),
    problems = $bindable([]),
    signEnabled = true,
    editorView = 'code',
    forceReadOnly = $bindable(false),
    headers = $bindable([]),
    activeHeader = $bindable(undefined),
    autocorrect = true,
    hideConsoleBar = false,
    removeStampsOnBuild = false,
    onChange,
    onBuild,
    onCorrect,
    onSign,
    onValidate,
    onReplicate,
    onNotification
  }: EnvelopeEditorProps = $props()

  let editorForm: EditorForm | null = $state(null)
  let initialEditorData = ''

  const builderContext = createBuilderContext(onNotification)

  const { editor, jsonSchema, envelope, envelopeIsSigned, activeSection, documentHeaders } =
    builderContext

  // jsonSchema is stored for validations in code editor
  $effect(() => {
    jsonSchema.set(jsonSchemaURL)
  })

  // When `data` is updated, update the internal envelope store.
  // If required instantiate a new envelope object to use.
  $effect(() => {
    const newData = data

    untrack(() => {
      builderContext.goblError.set(null)
      try {
        reloadData(newData)
      } catch (e) {
        console.error('invalid document data: ', e)
        $envelope = newEnvelope(null)
        initialState = 'empty'
      }
    })
  })

  $effect(() => {
    editor.set({ value: envelopeDocumentJSON($envelope), updatedAt: Date.now() })
  })

  $effect(() => {
    try {
      const editorValue = $editor ? hash(JSON.parse($editor.value)) : ''
      untrack(() => {
        setState(editorValue)
      })
    } catch (error) {
      // Allow invalid json entered
      initialState = 'invalid'
    }
  })

  if (signEnabled) {
    GOBL.keygen().then((k) => {
      builderContext.keypair.set(k)
      console.log('Created keypair.', k)
    })
  }

  // Dispatch all `change` events when the envelope is built.
  envelope.subscribe((envelope) => {
    if (initialState === 'init' || !envelope.doc) return

    onChange?.(JSON.stringify(envelope))
  })

  // This keeps problems array prop in sync with editor problems
  builderContext.editorProblems.subscribe((items) => {
    problems = items.map((problem) => ({
      message: problem.message,
      severity: problemSeverityMap[problem.severity]
    }))
  })

  // This keeps headers array prop in sync with document headers
  documentHeaders.subscribe((h) => {
    headers = h
  })

  // This keeps activeHeader prop in sync with active section
  activeSection.subscribe((section) => {
    const header = $documentHeaders.find((h) => h.slug === section.section)

    if (header) {
      header.active = true
    }

    activeHeader = header
  })

  const setState = (editorValue: string) => {
    if (!editorValue) {
      initialState = 'empty'
      return
    }

    if ($envelope?.sigs) {
      initialState = 'signed'
      return
    }

    if (editorValue !== initialEditorData) {
      initialState = 'modified'
      return
    }

    initialState = 'loaded'
  }

  // Exposed functions to perform the actions from outside
  export const build = async (options: BuildOptions = {}): Promise<State> => {
    const result = await actions.build(builderContext, options)
    onBuild?.(result)

    if (result?.error) {
      initialState = 'errored'
    } else {
      initialState = 'built'
    }

    if (!editorForm) return initialState

    if (initialState === 'built') {
      editorForm.recreateFormEditor()
      return initialState
    }

    displayAllErrors(result?.error?.message || '', onNotification)

    return initialState
  }

  export const removeSigs = async (): Promise<State> => {
    if (!$envelope?.sigs) {
      return initialState
    }
    return await build({ removeSignatures: true, removeStamps: true })
  }

  export const getCorrectionOptionsModel = async () => {
    const result = await actions.getCorrectionOptionsSchema(builderContext)

    if (!result?.schema) {
      initialState = 'errored'
      onNotification?.({ message: 'This document can not be corrected.', type: 'error' })
      return
    }

    return await generateCorrectOptionsModel(result?.schema || '')
  }

  export const correctWithOptions = async (options: string) => {
    const result = await actions.correct(options, builderContext, autocorrect)

    if (result?.error) {
      initialState = 'errored'
      displayAllErrors(result?.error?.message || '', onNotification)
      return false
    }

    onCorrect?.(result)
    onNotification?.({ message: 'Document successfully corrected.', type: 'success' })

    initialState = 'corrected'

    if (!editorForm) return true

    editorForm.recreateFormEditor()

    return true
  }

  export const sign = async () => {
    if (!signEnabled) return

    const result = await actions.sign(builderContext)
    onSign?.(result)

    // There is no need to set the state here as it is
    // handled by setState watcher. We return the value
    // to inform external caller
    if (result?.error) {
      displayAllErrors(result?.error?.message || '', onNotification)
      return 'errored'
    }

    onNotification?.({ message: 'Document successfully signed.', type: 'success' })

    return 'signed'
  }

  export const validate = async () => {
    const result = await actions.validate(builderContext)
    onValidate?.(result)
    if (result.isValid) {
      onNotification?.({ message: 'Document successfully validated.', type: 'success' })
    }
  }

  export const replicate = async () => {
    const result = await actions.replicate(builderContext)
    onReplicate?.(result)
  }

  export const reloadData = async (d: string | null = null) => {
    let parsedValue = null
    let envelopeValue: Envelope | null = null
    let hashedData = ''
    const internalData = d || data

    if (internalData != '') {
      parsedValue = JSON.parse(internalData)
    }

    if (internalData != '' && isEnvelope(parsedValue)) {
      envelopeValue = parsedValue
      hashedData = hash(parsedValue.doc)
    } else {
      envelopeValue = newEnvelope(parsedValue)
      hashedData = hash(parsedValue || '')
    }

    if (initialEditorData === hashedData) {
      return
    }

    // remove previous signatures if any and remove readOnly
    // so editor is writable
    let readOnlyValue = forceReadOnly
    forceReadOnly = false
    await removeSigs()

    $envelope = envelopeValue as Envelope
    // restore previous readOnly state
    forceReadOnly = readOnlyValue
    initialEditorData = hashedData

    // Only applies to form view
    if (editorView === 'code') return

    // If document loaded has the same schema as previously loaded
    // We need to force a rebuild of the UI model
    if (parsedValue?.$schema === $jsonSchema) {
      recreateVisualEditor()
    }

    // Attemp autobuild after editor refreshes
    setTimeout(() => {
      if (forceReadOnly || !envelopeValue?.doc || $envelopeIsSigned) return

      build({ removeStamps: removeStampsOnBuild })
    }, 100)
  }

  export const recreateVisualEditor = async () => {
    if (!editorForm) return

    editorForm.recreateFormEditor()
  }

  export const getHeaders = async () => {
    return $envelope.head || null
  }

  export const setHeaders = async (headers: EnvelopeHeader) => {
    if (!$envelope) return

    $envelope.head = headers
  }

  export const getSignatures = async () => {
    if (!$envelopeIsSigned) {
      return null
    }

    return $envelope.sigs || null
  }

  export const downloadJson = () => {
    if (!$envelope) {
      return
    }

    const filename = ($envelope.head?.uuid || 'gob') + '.json'
    fileSaver.saveAs(new Blob([JSON.stringify($envelope, null, 4)]), filename)

    onNotification?.({ message: 'Downloaded JSON file of GOBL document.', type: 'success' })
  }

  export const setActive = (header: DocumentHeader) => {
    $activeSection = {
      section: header.slug,
      scroll: true
    }
  }

  export const getEditorValue = () => {
    return JSON.parse($editor.value)
  }
</script>

<div class="@container flex flex-col h-full">
  <div class="flex-1 overflow-hidden relative">
    <div class="h-full absolute inset-0 flex flex-col">
      <div class="flex-1 overflow-auto">
        {#if editorView === 'code'}
          <EditorCode {hideConsoleBar} {jsonSchemaURL} {forceReadOnly} />
        {:else}
          <EditorForm
            bind:this={editorForm}
            {forceReadOnly}
            {removeStampsOnBuild}
            onSetState={(state) => {
              initialState = state
            }}
          />
        {/if}
      </div>
    </div>
  </div>
</div>
