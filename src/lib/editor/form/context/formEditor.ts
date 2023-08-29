import { getContext, onDestroy, setContext, tick } from "svelte";
import { editor, editorJSON } from "$lib/editor/stores.js";
import { type UIModelRootField, UIModelField, type SchemaOption, getUIModel } from "$lib/editor/form/utils/model.js";
import { getDebouncedFunction } from "$lib/editor/form/utils/debounce.js";
import { sleep } from "../utils/sleep.js";
import type { SchemaValue } from "../utils/schema.js";
import { writableDerived } from "$lib/store/writableDerived.js";
import type { Readable, Writable } from "svelte/store";

export const FormEditorContextId = Symbol("form-editor");

export type FormEditorContextType = {
  uiModel: Readable<{ value: UIModelRootField | undefined; updatedAt: number }>;
  changeFieldKey(field: UIModelField, value: SchemaValue): void;
  changeFieldValue(field: UIModelField, value: SchemaValue): void;
  deleteField(field: UIModelField): void;
  duplicateField(field: UIModelField): void;
  addField(parentField: UIModelField, option: SchemaOption): void;
  sortField(field: UIModelField, position: number): string | undefined;
  refreshUI(): void;
  updateEditor(): void;
  tryFocusField(field: UIModelField, retries?: number, delay?: number): Promise<boolean>;
  getFocusableElement(focusField?: UIModelField): HTMLElement | undefined;
};

export function getFormEditorContext(): FormEditorContextType {
  return getContext<FormEditorContextType>(FormEditorContextId);
}

export function createFormEditorContext(jsonSchemaURL: Readable<string>): FormEditorContextType {
  const uiModel: Writable<{
    value: UIModelRootField | undefined;
    updatedAt: number;
  }> = writableDerived(
    [jsonSchemaURL, editorJSON],
    ([$schema, $editor], set) => {
      debouncedRecreateUIModel($schema, $editor.value, set);
    },
    { value: undefined as UIModelRootField | undefined, updatedAt: 0 },
  );

  const debouncedUpdateEditor = getDebouncedFunction(500, updateEditor);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debouncedRecreateUIModel = getDebouncedFunction(200, recreateUIModel as any);

  let uiModelValue: UIModelRootField | undefined;
  const unsubscribeUiModelValue = uiModel.subscribe(({ value }) => {
    uiModelValue = value;
  });

  async function recreateUIModel(
    schema: string,
    editor: SchemaValue,
    set: (value: { value: UIModelRootField | undefined; updatedAt: number }) => void,
  ) {
    const model = (await getUIModel(schema, editor)) as UIModelRootField | undefined;

    if (model && model?.value !== editor) {
      updateEditor(model);
    }

    console.log("uiModel", model);
    console.log("$schema", schema);

    set({ value: model, updatedAt: Date.now() });
  }

  function updateEditor(model: UIModelField | undefined = uiModelValue) {
    if (!model) return;

    const value = model.root.toJSON();
    console.log("EDITOR UPDATED!", value.length);
    editor.set({ value, updatedAt: Date.now() });
  }

  function refreshUI() {
    console.log("UI UPDATED!");
    uiModel.update(({ value }) => ({ value, updatedAt: Date.now() }));
  }

  function changeFieldKey(field: UIModelField, key: string) {
    const result = field.setKey(key);
    if (!result) return;

    debouncedUpdateEditor(field.root);
  }

  function changeFieldValue(field: UIModelField, value: SchemaValue) {
    const result = field.setValue(value);
    if (!result) return;

    debouncedUpdateEditor(field.root);
  }

  function deleteField(field: UIModelField) {
    const result = field.delete();
    if (!result) return;

    updateEditor();
  }

  function duplicateField(field: UIModelField) {
    const newField = field.duplicate();
    if (!newField) return;

    updateEditor();

    const focusField = newField.getFirstFocusableChild();
    tryFocusField(focusField);
  }

  function addField(parentField: UIModelField, option: SchemaOption) {
    const newField = parentField.addChildField(option, undefined);
    if (!newField) return;

    updateEditor();

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
    tryFocusField,
    getFocusableElement,
  };

  onDestroy(() => {
    unsubscribeUiModelValue();
  });

  return setContext<FormEditorContextType>(FormEditorContextId, initialState);
}
