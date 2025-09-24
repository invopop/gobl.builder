import type * as monaco from 'monaco-editor'
import type { GOBLError, Keypair } from '@invopop/gobl-worker'
import type { Readable, Writable } from 'svelte/store'
import type { UIModelField, UIModelRootField } from '$lib/editor/form/utils/model'
import type { Envelope, EnvelopeHeader } from './envelope'
import type { EditorProblem } from '../editor/EditorProblem.js'
import type { IconSource } from '@steeze-ui/svelte-icon'
import type { Snippet } from 'svelte'

export type ButtonVariant = 'default' | 'primary' | 'danger'

export type State =
  | 'init'
  | 'empty'
  | 'loaded'
  | 'modified'
  | 'invalid'
  | 'errored'
  | 'built'
  | 'signed'
  | 'corrected'

export type BuildOptions = {
  removeStamps?: boolean
  removeSignatures?: boolean
}

export type DocumentHeader = {
  label: string
  slug: string
  active?: boolean
}

export type BuilderContext = {
  envelope: Writable<Envelope>
  keypair: Writable<Keypair | null>
  goblError: Writable<GOBLError | null>
  editorProblems: Writable<monaco.editor.IMarker[]>
  jsonSchema: Writable<string | null>
  editor: Writable<{
    updatedAt: number
    value: string
  }>
  editorJSON: Readable<{
    updatedAt: number
    value: Record<string, unknown> | Error
  }>
  validEditor: Readable<boolean>
  envelopeIsSigned: Readable<boolean>
  currentEditorSchema: Readable<string>
  someEditorValueIsEmpty: Readable<boolean>
  recreatingUiModel: Writable<boolean>
  undoAvailable: Writable<boolean>
  redoAvailable: Writable<boolean>
  uiModel: Writable<{
    value: UIModelRootField | undefined
    updatedAt: number
  }>
  activeSection: Writable<{ section: null | string; scroll: boolean }>
  activeItem: Writable<null | string>
  highlightedItem: Writable<null | string>
  scrollingSection: Writable<boolean>
  documentHeaders: Readable<DocumentHeader[]>
  updateSchema(value: string): void
  recreateEditor(): void
  lastFocusedElement: Writable<string | null>
}

export interface BuildActionResponse {
  result?: string
  error?: GOBLError
}

export interface ValidateActionResponse {
  isValid: boolean
  error?: GOBLError
}

// Props

export interface BaseButtonProps {
  icon?: IconSource | undefined
  variant?: ButtonVariant
  disabled?: boolean
  children?: Snippet
  onclick?: () => void
}

export interface EditorCodeProps {
  jsonSchemaURL: string
  forceReadOnly?: boolean
  hideConsoleBar?: boolean
}

export interface EditorFormModalCorrectProps {
  model: UIModelField | undefined
  onclose?: () => void
  onConfirm?: (value: string) => void
}

export interface EditorFormModalHeadersProps {
  header?: EnvelopeHeader | null
  onclose?: () => void
  onConfirm?: (value: EnvelopeHeader) => void
}

export interface EditorFormModalSignaturesProps {
  sigs?: string[] | null
  onclose?: () => void
}
export interface EnvelopeEditorProps {
  // Used for JSON Schema validation within Monaco Editor. When set, this should  be the JSON Schema URL of a GOBL document, e.g. an invoice. Not an envelope.
  jsonSchemaURL?: string
  // Data is used for setting editor contents. Note: there is "one way" binding;
  // e.g. you can set data but changes are not bound to the parent. Use the
  // `change` event, to receive changes to the editor contents and GOBL
  // envelope.
  data?: string
  // Binding this prop from outside will show the state of the editor. Posible values:
  // init: the app is starting
  // empty: there is no content
  // loaded: implies that a document was loaded and no further action has been taken yet
  // modified: something is being changed
  // invalid: there are syntax errors, cannot be built
  // errored: build was attempted, but failed
  // built: document has been built, is valid, and can be modified again
  // signed: signature applied, main content is now read-only, headers could still be modified, but we don't need to worry about that yet
  state?: State
  // Problems is an array of Monaco Editor problem markers. It can be used
  // upstream to keep track of the validity of the GOBL document.
  problems?: EditorProblem[]
  // When enabled, a "Sign" action is available. A client-only keypair is generated and used for signing GOBL documents.
  signEnabled?: boolean
  // Whether shows the code or the form editor
  editorView?: string
  // When enabled, it sets the editor as readOnly even if the document is not signed
  forceReadOnly?: boolean
  // Expose document headers to navigate to a specific section from outside
  headers?: DocumentHeader[]
  // Expose activeHeader
  activeHeader?: DocumentHeader | undefined
  // If autocorrect is set to false the envelope is not updated automatically. Event `corrected` is always fired with the result
  autocorrect?: boolean
  // If hideConsoleBar is true will force to hide the error suggestions in Code View
  hideConsoleBar?: boolean
  // If removeStampsOnBuild is true will reset the header stamps on build
  removeStampsOnBuild?: boolean
  // callback to perform actions after envelope changes
  onChange?: (envelope: string) => void
  // callback to perform actions after envelope is built
  onBuild?: (result: BuildActionResponse) => void
  // callback to perform actions after envelope is corrected
  onCorrect?: (result: BuildActionResponse) => void
  // callback to perform actions after envelope is signed
  onSign?: (result: BuildActionResponse) => void
  // callback to perform actions after envelope is validated
  onValidate?: (result: ValidateActionResponse) => void
  // callback to perform actions after envelope is replicated
  onReplicate?: (result: BuildActionResponse) => void
}

export interface ExpandButtonProps {
  open?: boolean
  onclick?: () => void
}

export interface ModalProps {
  title?: string
  confirmButtonIcon?: IconSource | undefined
  confirmButtonText?: string
  hideConfirmButton?: boolean
  children?: Snippet
  footer?: Snippet
  onclose?: () => void
  onConfirm?: () => void
}

export interface ObjectEditorProps {
  jsonSchemaURL?: string
  data?: unknown
  id?: string
  readOnly?: boolean
  model?: UIModelField | undefined
}

export interface SelectSchemasProps {
  value?: string
  placeholder?: string
  allowAll?: boolean
  navBar?: boolean
  onChange?: (value: string) => void
}
