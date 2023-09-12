import { getContext, onDestroy, setContext, tick } from "svelte";
import { editor, editorJSON } from "$lib/editor/stores.js";
import { type UIModelRootField, UIModelField, type SchemaOption, getUIModel } from "$lib/editor/form/utils/model.js";
import { getDebouncedFunction } from "$lib/editor/form/utils/debounce.js";
import { sleep } from "../utils/sleep.js";
import type { SchemaValue } from "../utils/schema.js";
import { writableDerived } from "$lib/store/writableDerived.js";
import { get, writable, type Readable, type Writable } from "svelte/store";

export const FormEditorContextId = Symbol("form-editor");
export const schemaUrlForm = writable<string | null>(null);
export const recreatingUiModel = writable(false);

export type FormEditorContextType = {
  uiModel: Readable<{ value: UIModelRootField | undefined; updatedAt: number }>;
  changeFieldKey(field: UIModelField, value: SchemaValue): void;
  changeFieldValue(field: UIModelField, value: SchemaValue): void;
  deleteField(field: UIModelField): void;
  duplicateField(field: UIModelField): void;
  moveField(field: UIModelField, direction: "up" | "down"): void;
  addField(parentField: UIModelField, option: SchemaOption): void;
  sortField(field: UIModelField, position: number): string | undefined;
  refreshUI(): void;
  updateEditor(): void;
  updateSchema(value: string): void;
  tryFocusField(field: UIModelField, retries?: number, delay?: number): Promise<boolean>;
  getFocusableElement(focusField?: UIModelField): HTMLElement | undefined;
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

  function changeFieldValue(field: UIModelField, value: SchemaValue) {
    const result = field.setValue(value);
    if (!result) return;

    updateEditor(field.root);
  }

  function deleteField(field: UIModelField) {
    const result = field.delete();
    if (!result) return;

    updateEditor();
    refreshUI();
  }

  function duplicateField(field: UIModelField) {
    const newField = field.duplicate();
    if (!newField) return;

    updateEditor();
    refreshUI();

    const focusField = newField.getFirstFocusableChild();
    tryFocusField(focusField);
  }

  function moveField(field: UIModelField, direction: "up" | "down") {
    const swapPositions = (array: UIModelField[], a: number, b: number) => {
      array[a].key = String(b);
      array[b].key = String(a);
      [array[a], array[b]] = [array[b], array[a]];
    };

    const children = field?.parent?.children || [];

    const factor = direction === "down" ? 1 : -1;

    const currentKey = Number(field?.key);
    const destinationKey = currentKey + factor;

    if (destinationKey < 0 || destinationKey >= children.length) return;

    swapPositions(children, currentKey, destinationKey);

    updateEditor();
    refreshUI();
  }

  function addField(parentField: UIModelField, option: SchemaOption) {
    const newField = parentField.addChildField(option, undefined);
    if (!newField) return;

    updateEditor();
    refreshUI();

    const focusField = newField.getFirstFocusableChild();
    tryFocusField(focusField);
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

  async function tryFocusField(field?: UIModelField, retries = 5, delay = 200): Promise<boolean> {
    if (!field) return false;

    await tick();

    while (--retries > 0) {
      await sleep(delay);

      const el = getFocusableElement(field);
      if (!el) continue;

      el.scrollIntoView({ behavior: "auto", block: "center" });
      el.focus();

      return true;
    }

    return false;
  }

  function getFocusableElement(focusField?: UIModelField): HTMLElement | undefined {
    if (!focusField) return;

    if (focusField?.isContainer()) {
      return document.querySelector(`#${focusField.id} > .add-field-button`) as HTMLElement;
    } else {
      return document.querySelector(`#${focusField.id}`) as HTMLElement;
    }
  }

  async function updateSchema(value: string) {
    const parsedValue = JSON.parse(get(editor).value);
    parsedValue.$schema = value;
    editor.set({ value: JSON.stringify(parsedValue, null, 4), updatedAt: Date.now() });
    schemaUrlForm.set(value);
  }

  const initialState: FormEditorContextType = {
    uiModel,
    changeFieldKey,
    changeFieldValue,
    deleteField,
    duplicateField,
    moveField,
    addField,
    sortField,
    refreshUI,
    updateEditor,
    tryFocusField,
    getFocusableElement,
    updateSchema,
  };

  onDestroy(() => {
    unsubscribeUiModelValue();
  });

  return setContext<FormEditorContextType>(FormEditorContextId, initialState);
}
