import { getContext, setContext } from "svelte";
import { derived, type Readable } from "svelte/store";
import { editor, editorJSON } from "$lib/stores.js";
import { type UIModelRootField, UIModelField, type SchemaOption, getUIModel } from "$lib/editor/form/utils/model.js";
import { getDebouncedFunction } from "$lib/editor/form/utils/debounce.js";
import { sleep } from "../utils/sleep.js";
import type { SchemaValue } from "../utils/schema.js";

export const FormEditorContextId = Symbol("form-editor");

export type FormEditorContextType = {
  uiModel: Readable<UIModelRootField | undefined>;
  changeField(field: UIModelField, value: SchemaValue): void;
  deleteField(field: UIModelField): void;
  duplicateField(field: UIModelField): void;
  addField(parentField: UIModelField, option: SchemaOption, position?: number): void;
  sortField(field: UIModelField, position: number): void;
};

export function getFormEditorContext(): FormEditorContextType {
  return getContext<FormEditorContextType>(FormEditorContextId);
}

export function createFormEditorContext(jsonSchemaURL: Readable<string>): FormEditorContextType {
  const uiModel = derived<Readable<any>[], UIModelRootField | undefined>(
    [jsonSchemaURL, editorJSON],
    ([$schema, $value], set) => {
      async function getModel() {

        const noSchema = $value && $schema && !$value.$schema

        if (noSchema) {
          delete $value.$schema
          $value = { $schema, ...$value }
        }

        const model = await getUIModel($schema, $value);

        if (model && noSchema) {
          updateEditor(model.root)
        }

        console.log("uiModel", model);
        console.log("$schema", $schema);

        set(model);
      }

      getModel();
    }
  );

  function updateEditor(model: UIModelRootField) {
    const newEditorStr = model.toJSON();
    console.log("EDITOR UPDATED!", newEditorStr.length);
    editor.set(newEditorStr);
  }

  const debouncedUpdateEditor = getDebouncedFunction(200, updateEditor);

  function changeField(field: UIModelField, value: SchemaValue) {
    console.log("FIELD CHANGED!", field);
    field.value = value;
    debouncedUpdateEditor(field.root);
  }

  function deleteField(field: UIModelField) {
    if (field.is.root) return;
    if (!field.parent) return;

    field.parent.deleteChildFieldById(field.id);
    console.log("FIELD DELETED!", field.key, " from parent ", field.parent.key, field.parent);

    updateEditor(field.root);
  }

  function duplicateField(field: UIModelField) {
    if (field.is.root) return;
    if (!field.parent) return;

    console.log("FIEL22D DUPLICATED!", field);

    const newField = field.clone();
    const childs = field.parent.children || ([] as UIModelField[]);

    // @todo: move to UIModel class
    if (field.parent.isObject()) {
      const keyMap = childs.reduce((acc, curr) => {
        acc[curr.key] = curr;
        return acc;
      }, {} as Record<string, unknown>);

      let n = 0,
        key;
      do {
        key = `${newField.key}_${++n}`;
      } while (keyMap[key]);

      newField.key = key;
      field.parent.children = [...childs, newField];
    } else if (field.parent.isArray()) {
      const key = childs.length + "";
      newField.key = key;
      field.parent.children = [...childs, newField];
    }

    console.log("FIELD DUPLICATED!", field);

    updateEditor(field.root);
  }

  function addField(parentField: UIModelField, option: SchemaOption, position?: number) {
    console.log("ADDING FIELD ON", parentField.type, 'POSITION', position);

    const newField = parentField.addChildField(option, position);
    if (!newField) return;

    console.log("ADD FIELD !", option, newField);

    updateEditor(parentField.root);

    tryQuickFocus(newField);
  }

  function sortField(field: UIModelField, position: number) {
    console.log("SORTING FIELD", field.key, position);

    field.sortField(position);
    updateEditor(field.root);
  }

  async function tryQuickFocus(field: UIModelField, retries = 5): Promise<void> {
    // @todo: Refactor this
    // Quick and dirty, use a context state (pendingFocus / nextFocus) store instead


    if (field.isObject() || field.isArray()) {
      const [firstChild] = field.children || []
      return tryQuickFocus(firstChild)
    }

    while (--retries > 0) {
      await sleep(200);

      const selector = `#${field.id}`;
      const el = document.querySelector(selector) as HTMLElement;

      if (!el) continue;
      console.log("FOCUS ", selector, el);

      el.scrollIntoView({ behavior: "auto", block: "center" });
      el.focus();
      break;
    }
  }

  const initialState: FormEditorContextType = {
    uiModel,
    changeField,
    deleteField,
    duplicateField,
    addField,
    sortField,
  };

  return setContext<FormEditorContextType>(FormEditorContextId, initialState);
}
