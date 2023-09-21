import { getContext, onDestroy, setContext } from "svelte";
import { editor, editorJSON } from "$lib/editor/stores.js";
import { type UIModelRootField, UIModelField, getUIModel } from "$lib/editor/form/utils/model.js";
import { getDebouncedFunction } from "$lib/editor/form/utils/debounce.js";
import type { SchemaValue } from "../utils/schema.js";
import { writableDerived } from "$lib/store/writableDerived.js";
import { get, writable, type Readable, type Writable } from "svelte/store";

export const FormEditorContextId = Symbol("form-editor");
export const schemaUrlForm = writable<string | null>(null);
export const recreatingUiModel = writable(false);

export type FormEditorContextType = {
  uiModel: Readable<{ value: UIModelRootField | undefined; updatedAt: number }>;
  changeFieldKey(field: UIModelField, value: SchemaValue): void;
  sortField(field: UIModelField, position: number): string | undefined;
  refreshUI(): void;
  updateEditor(): void;
  updateSchema(value: string): void;
};

export function getFormEditorContext(): FormEditorContextType {
  return getContext<FormEditorContextType>(FormEditorContextId);
}

export function createFormEditorContext(jsonSchemaURL: Readable<string | null>): FormEditorContextType {
  const uiModel: Writable<{
    value: UIModelRootField | undefined;
    updatedAt: number;
  }> = writableDerived(
    jsonSchemaURL,
    ($schema, set) => {
      debouncedRecreateUIModel($schema, set);
    },
    { value: undefined as UIModelRootField | undefined, updatedAt: 0 },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debouncedRecreateUIModel = getDebouncedFunction(200, recreateUIModel as any);

  let uiModelValue: UIModelRootField | undefined;
  const unsubscribeUiModelValue = uiModel.subscribe(({ value }) => {
    uiModelValue = value;
  });

  async function recreateUIModel(
    schema: string,
    set: (value: { value: UIModelRootField | undefined; updatedAt: number }) => void,
  ) {
    recreatingUiModel.set(true);
    const value = get(editorJSON).value;
    const model = (await getUIModel(schema, value)) as UIModelRootField | undefined;

    if (model && model?.value !== value) {
      updateEditor(model);
    }

    set({ value: model, updatedAt: Date.now() });
    recreatingUiModel.set(false);
  }

  function updateEditor(model: UIModelField | undefined = uiModelValue) {
    if (!model) return;

    const value = model.root.toJSON();
    editor.set({ value, updatedAt: Date.now() });
  }

  function refreshUI() {
    uiModel.update(({ value }) => ({ value, updatedAt: Date.now() }));
  }

  function changeFieldKey(field: UIModelField, key: string) {
    const result = field.setKey(key);
    if (!result) return;

    updateEditor(field.root);
  }

  function sortField(field: UIModelField, position: number, update = false): string | undefined {
    const result = field.sortField(position);
    if (!result) return;

    if (update) {
      updateEditor();
    } else {
      refreshUI();
    }

    return result;
  }

  async function updateSchema(value: string) {
    const parsedValue = get(editor).value ? JSON.parse(get(editor).value) : {};
    parsedValue.$schema = value;
    editor.set({ value: JSON.stringify(parsedValue, null, 4), updatedAt: Date.now() });
    schemaUrlForm.set(value);
  }

  const initialState: FormEditorContextType = {
    uiModel,
    changeFieldKey,
    sortField,
    refreshUI,
    updateEditor,
    updateSchema,
  };

  onDestroy(() => {
    unsubscribeUiModelValue();
  });

  return setContext<FormEditorContextType>(FormEditorContextId, initialState);
}
