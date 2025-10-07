import type * as monaco from 'monaco-editor'
import type { GOBLError, Keypair } from '@invopop/gobl-worker'
import type { Readable, Writable } from 'svelte/store'
import type { UIModelField, UIModelRootField } from '$lib/editor/form/utils/model'
import type { Envelope, EnvelopeHeader } from './envelope'
import type { EditorProblem } from '../editor/EditorProblem.js'
import type { IconSource } from '@steeze-ui/svelte-icon'
import type { Snippet } from 'svelte'
import type { SchemaValue } from '$lib/editor/form/utils/schema'

export type ActionMethod =
  | 'build'
  | 'sign'
  | 'validate'
  | 'replicate'
  | 'correct'
  | 'removeSigs'
  | 'showSignatures'
  | 'showHeaders'

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
  notify(notification: NotificationProps): void
}

export interface BuildActionResponse {
  result?: string
  error?: GOBLError
}

export interface ValidateActionResponse {
  isValid: boolean
  error?: GOBLError
}

export interface EditorEvents {
  onFieldAdded?: (field: UIModelField) => void
  onFieldDeleted?: (field: UIModelField) => void
  onFieldDuplicated?: (field: UIModelField) => void
  onFieldMoved?: (field: UIModelField) => void
  onFieldValueUpdated?: (field: UIModelField) => void
  onFieldKeyUpdated?: (field: UIModelField) => void
}

// Props
export interface AbstractFieldProps extends EditorEvents {
  field: UIModelField
  readOnly?: boolean
}

export interface AddFieldMenuProps {
  field: UIModelField
  inputRef?: HTMLElement | undefined
  menuRef?: HTMLElement | undefined
  onOpenAddFieldMenu?: () => void
  onCloseAddFieldMenu?: () => void
  onFieldAdded?: (field: UIModelField) => void
}

export interface ArrayFieldProps extends AbstractFieldProps {}

export interface BooleanFieldProps extends AbstractFieldProps {
  children?: Snippet
}
export interface BaseButtonProps {
  icon?: IconSource | undefined
  variant?: ButtonVariant
  disabled?: boolean
  children?: Snippet
  onclick?: () => void
}

export interface DynamicFormProps extends EditorEvents {
  showSchemaField?: boolean
  isEmptySchema?: boolean
  model?: UIModelRootField | UIModelField | undefined
  readOnly?: boolean
  onUiRefreshNeeded?: (model: UIModelRootField | UIModelField | undefined) => void
}

export interface EditableDateFieldProps {
  field: UIModelField<string>
  showError?: boolean
  onBlur?: (value: string) => void
  onEdit?: (value: string) => void
}

export interface EditableFieldKeyProps extends AbstractFieldProps {
  parseKey?: (key: SchemaValue) => string
}

export interface EditableFieldProps extends AbstractFieldProps {
  parseValue: (value: SchemaValue) => SchemaValue
}

export interface EditableSelectFieldProps {
  field: UIModelField<string>
  options: { label: string; value: string | boolean }[]
  showError?: boolean
  onEdit?: (value: string) => void
  onBlur?: (value: string) => void
  onfocus?: (event: FocusEvent) => void
}

export interface EditableTextFieldProps {
  field: UIModelField<string>
  showError?: boolean
  classes?: string
  value?: string
  id?: string
  onBlur?: (value: string) => void
  onEdit?: (value: string) => void
  onfocus?: (event: FocusEvent) => void
}

export interface EditorCodeProps {
  jsonSchemaURL: string
  forceReadOnly?: boolean
  hideConsoleBar?: boolean
}

export interface EditorFormProps {
  forceReadOnly?: boolean
  removeStampsOnBuild?: boolean
  onSetState?: (state: State) => void
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

export interface EditorProblemProps {
  problem: monaco.editor.IMarker
}

export interface NotificationProps {
  message: string
  type: 'info' | 'error' | 'success'
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
  // callback to perform actions after notification is emitted
  onNotification?: (notification: NotificationProps) => void
}

export interface ExpandButtonProps {
  open?: boolean
  onclick?: () => void
}

export interface FallbackFieldProps {
  field: UIModelField
}

export interface FieldButtonProps {
  icon: IconSource
  confirmationIcon?: IconSource | null
  tooltipText?: string
  isDestructive?: boolean
  disabled?: boolean
  onClick?: () => void
}

export interface FieldButtonsProps {
  field?: UIModelField | undefined
  onAdd?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export interface FieldContextMenuProps {
  field: UIModelField
  onFieldAdded?: (field: UIModelField) => void
  onFieldDeleted?: (field: UIModelField) => void
  onFieldDuplicated?: (field: UIModelField) => void
  onFieldMoved?: (field: UIModelField) => void
}

export interface FieldErrorProps {
  error?: string
}

export interface FieldTitleProps {
  field: UIModelField
}

export interface IntegerFieldProps extends AbstractFieldProps {
  children?: Snippet
}

export interface LeafFieldProps extends AbstractFieldProps {
  parseValue: (value: SchemaValue) => SchemaValue
  parseKey?: ((key: SchemaValue) => string) | undefined
  field: UIModelField<string>
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

export interface ObjectFieldProps extends AbstractFieldProps {}

export interface ReadOnlyFieldProps {
  field: UIModelField
}

export interface RootFieldProps extends AbstractFieldProps {}

export interface SchemaFieldProps {
  isEmptySchema?: boolean
}

export interface SectionWrapperProps extends AbstractFieldProps {
  children?: Snippet
  extraContent?: Snippet
}

export interface SelectSchemasProps {
  value?: string
  placeholder?: string
  allowAll?: boolean
  navBar?: boolean
  onChange?: (value: string) => void
}

export interface StringFieldProps extends AbstractFieldProps {
  children?: Snippet
}
