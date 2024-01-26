import { getContext, setContext } from "svelte";
import { editor, editorJSON } from "$lib/editor/stores.js";
import { type UIModelRootField, getUIModel } from "$lib/editor/form/utils/model.js";
import { getDebouncedFunction } from "$lib/editor/form/utils/debounce.js";
import { writableDerived } from "$lib/store/writableDerived.js";
import { get, writable, type Readable, type Writable } from "svelte/store";

export const FormEditorContextId = Symbol("form-editor");
export const schemaUrlForm = writable<string | null>(null);
export const recreatingUiModel = writable(false);

export type FormEditorContextType = {
  uiModel: Readable<{ value: UIModelRootField | undefined; updatedAt: number }>;
  updateSchema(value: string): void;
};

export function getFormEditorContext(): FormEditorContextType {
  return getContext<FormEditorContextType>(FormEditorContextId);
}

export function createFormEditorContext(jsonSchemaURL: Readable<string | null>): FormEditorContextType {
  const formUniqueId = Math.random().toString(36).slice(2, 7);

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

  async function recreateUIModel(
    schema: string,
    set: (value: { value: UIModelRootField | undefined; updatedAt: number }) => void,
  ) {
    recreatingUiModel.set(true);
    const value = get(editorJSON).value;
    const model = (await getUIModel(schema, value, formUniqueId)) as UIModelRootField | undefined;

    if (model && model?.value !== value) {
      const value = model.root.toJSON();
      editor.set({ value, updatedAt: Date.now() });
    }

    set({ value: model, updatedAt: Date.now() });
    recreatingUiModel.set(false);
  }

  async function updateSchema(value: string) {
    const parsedValue = get(editor).value ? JSON.parse(get(editor).value) : {};
    parsedValue.$schema = value;
    editor.set({ value: JSON.stringify(parsedValue, null, 4), updatedAt: Date.now() });
    schemaUrlForm.set(value);
  }

  const initialState: FormEditorContextType = {
    uiModel,
    updateSchema,
  };

  return setContext<FormEditorContextType>(FormEditorContextId, initialState);
}
