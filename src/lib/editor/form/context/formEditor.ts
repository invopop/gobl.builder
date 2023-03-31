import { getContext, setContext } from "svelte";
import { derived, type Readable } from "svelte/store";
import { editor, editorJSON } from "$lib/stores.js";
import {
  fieldIsArray,
  fieldIsObject,
  getJSONFromUIModel,
  getUIModel,
  type SchemaValue,
} from "$lib/editor/form/utils/schema.js";
import type { UIModel, UIModelField, SchemaOption } from "$lib/editor/form/utils/schema.js";
import { getDebouncedFunction } from "$lib/editor/form/utils/debounce.js";
import { sleep } from "../utils/sleep.js";

export const FormEditorContextId = Symbol("form-editor");

export type FormEditorContextType = {
  uiModel: Readable<UIModel | undefined>;
  changeField(field: UIModelField, value: SchemaValue): void;
  deleteField(field: UIModelField): void;
  duplicateField(field: UIModelField): void;
  addField(parentField: UIModelField, option: SchemaOption): void;
};

export function getFormEditorContext(): FormEditorContextType {
  return getContext<FormEditorContextType>(FormEditorContextId);
}

export function createFormEditorContext(jsonSchemaURL: Readable<string>): FormEditorContextType {
  const uiModel = derived<Readable<any>[], UIModel | undefined>(
    [jsonSchemaURL, editorJSON],
    ([$schema, $value], set) => {
      (async () => {
        const model = await getUIModel({ schema: $schema, value: $value });

        console.log("uiModel", model);
        console.log("$schema", $schema);

        set(model);
      })();
    }
  );

  function updateEditor(model: UIModel) {
    const newEditor = getJSONFromUIModel(model);
    const newEditorStr = JSON.stringify(newEditor, null, 4);

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

    if (fieldIsObject(field.parent)) {
      // delete field.parent.value[field.name as string]
      const newChildrens = { ...field.parent.children };
      delete newChildrens[field.name as string];
      field.parent.children = newChildrens;

      console.log("FIELD DELETED!", field.name, " from parent ", field.parent.name, field.parent);
    } else if (fieldIsArray(field.parent)) {
      // const index = Number(field.name)
      // field.parent.value.splice(index, 1)
      const newChildrens = { ...field.parent.children };
      delete newChildrens[field.name as string];
      field.parent.children = newChildrens;

      console.log("FIELD DELETED!", field.name, " from parent ", field.parent.name, field.parent);
    }

    updateEditor(field.root);
  }

  function duplicateField(field: UIModelField) {
    if (field.is.root) return;
    if (!field.parent) return;

    const newField = { ...field };

    if (fieldIsObject(field.parent)) {
      let n = 0,
        name;
      do {
        name = `${newField.name}_${++n}`;
      } while ((field.parent.children || {})[name]);

      newField.name = name;

      field.parent.children = {
        ...field.parent.children,
        [name]: newField,
      };
    } else if (fieldIsArray(field.parent)) {
      const name = Object.keys(field.parent.children || {}).length + "";
      newField.name = name;

      field.parent.children = {
        ...field.parent.children,
        [name]: newField,
      };
    }

    console.log("FIELD DUPLICATED!", field);

    updateEditor(field.root);
  }

  function addField(parentField: UIModelField, option: SchemaOption) {
    console.log(parentField.type);
    if (parentField.type !== "object" && parentField.type !== "array") return;

    let value;

    switch (option.schema.type) {
      case "object": {
        value = {};
        break;
      }
      case "array": {
        value = [];
        break;
      }
      case "null": {
        value = null;
        break;
      }
      case "string": {
        value = "";
        break;
      }
      case "integer":
      case "number": {
        value = 0;
        break;
      }
      case "boolean": {
        value = true;
        break;
      }
      case "": {
        value = [];
        break;
      }
    }

    (async () => {
      const childLength = Object.values(parentField.children || {}).length || 0;

      const newChild = await getUIModel({
        schema: option.schema,
        value,
        index: childLength,
        level: parentField.level + 1,
        name: option.name,
        parent: parentField,
        root: parentField.root,
      });

      if (!newChild) return;

      console.log("ADD FIELD !", option, newChild);

      const index = fieldIsArray(parentField) ? childLength : option.name;

      parentField.children = {
        ...parentField.children,
        [index]: newChild,
      };

      updateEditor(parentField.root);

      await tryQuickFocus(newChild.id);
    })();
  }

  async function tryQuickFocus(id: string, retries = 5) {
    // @todo: Refactor this
    // Quick and dirty, use a context state (pendingFocus / nextFocus) store instead

    while (--retries > 0) {
      await sleep(200);

      const selector = `#${id}`;
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
  };

  return setContext<FormEditorContextType>(FormEditorContextId, initialState);
}
