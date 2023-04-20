import { getContext, onDestroy, setContext } from "svelte"
import { editor, editorJSON } from "$lib/stores.js"
import { type UIModelRootField, UIModelField, type SchemaOption, getUIModel } from "$lib/editor/form/utils/model.js"
import { getDebouncedFunction } from "$lib/editor/form/utils/debounce.js"
import { sleep } from "../utils/sleep.js"
import type { SchemaValue } from "../utils/schema.js"
import { writableDerived } from "$lib/store/writableDerived.js"
import type { Readable, Writable } from "svelte/store"

export const FormEditorContextId = Symbol("form-editor")

export type FormEditorContextType = {
  uiModel: Readable<{ value: UIModelRootField | undefined, updatedAt: number }>
  changeFieldKey(field: UIModelField, value: SchemaValue): void
  changeFieldValue(field: UIModelField, value: SchemaValue): void
  deleteField(field: UIModelField): void
  duplicateField(field: UIModelField): void
  addField(parentField: UIModelField, option: SchemaOption, position?: number): void
  sortField(field: UIModelField, position: number): string | undefined
  refreshUI(): void
  updateEditor(): void
}

export function getFormEditorContext(): FormEditorContextType {
  return getContext<FormEditorContextType>(FormEditorContextId)
}

export function createFormEditorContext(jsonSchemaURL: Readable<string>): FormEditorContextType {
  const uiModel: Writable<{
    value: UIModelRootField | undefined
    updatedAt: number
  }> = writableDerived(
    [jsonSchemaURL, editorJSON],
    ([$schema, $editor], set) => {
      debouncedRecreateUIModel($schema, $editor.value, set)
    },
    { value: undefined as UIModelRootField | undefined, updatedAt: 0 }
  )

  const debouncedUpdateEditor = getDebouncedFunction(500, updateEditor)
  const debouncedRecreateUIModel = getDebouncedFunction(200, recreateUIModel as any) 

  let uiModelValue: UIModelRootField | undefined
  const unsubscribeUiModelValue = uiModel.subscribe(({ value }) => {
    uiModelValue = value
  })

  async function recreateUIModel(
    schema: string,
    editor: SchemaValue,
    set: (value: { value: UIModelRootField | undefined, updatedAt: number }) => void
  ) {
    const model = await getUIModel(schema, editor) as UIModelRootField | undefined

    if (model && model?.value !== editor) {
      updateEditor(model)
    }

    console.log("uiModel", model)
    console.log("$schema", schema)

    set({ value: model, updatedAt: Date.now() })
  }

  function updateEditor(model: UIModelField | undefined = uiModelValue) {
    if (!model) return

    const value = model.root.toJSON()
    console.log("EDITOR UPDATED!", value.length)
    editor.set({ value, updatedAt: Date.now() })
  }

  function refreshUI() {
    console.log("UI UPDATED!")
    uiModel.update(({ value }) => ({ value, updatedAt: Date.now() }))
  }

  function changeFieldKey(field: UIModelField, key: string) {
    const result = field.setKey(key)
    if (!result) return

    debouncedUpdateEditor(field.root)
  }

  function changeFieldValue(field: UIModelField, value: SchemaValue) {
    const result = field.setValue(value)
    if (!result) return

    debouncedUpdateEditor(field.root)
  }

  function deleteField(field: UIModelField) {
    const result = field.delete()
    if (!result) return

    updateEditor()
  }

  function duplicateField(field: UIModelField) {
    const newField = field.duplicate()
    if (!newField) return

    updateEditor()
    tryQuickFocus(newField)
  }

  function addField(parentField: UIModelField, option: SchemaOption, position?: number) {
    const newField = parentField.addChildField(option, undefined, position)
    if (!newField) return

    updateEditor()
    tryQuickFocus(newField)
  }

  function sortField(field: UIModelField, position: number, update = false): string | undefined {
    const result = field.sortField(position)
    if (!result) return

    if (update) {
      updateEditor()
    } else {
      refreshUI()
    }

    return result
  }

  async function tryQuickFocus(field: UIModelField, retries = 5): Promise<boolean> {
    // @todo: Refactor this
    // Quick and dirty, use a context state (pendingFocus / nextFocus) store instead

    if (field.isObject() || field.isArray()) {
      const [firstChild] = field.children || []
      if (!firstChild) return false

      return tryQuickFocus(firstChild)
    }

    while (--retries > 0) {
      await sleep(200)

      const selector = `#${field.id}`
      const el = document.querySelector(selector) as HTMLElement

      if (!el) continue

      el.scrollIntoView({ behavior: "auto", block: "center" })
      el.focus()

      return true
    }

    return false
  }

  const initialState: FormEditorContextType = {
    uiModel,
    changeFieldKey,
    changeFieldValue,
    deleteField,
    duplicateField,
    addField,
    sortField,
    refreshUI,
    updateEditor,
  }

  onDestroy(() => {
    unsubscribeUiModelValue()
  })

  return setContext<FormEditorContextType>(FormEditorContextId, initialState)
}
