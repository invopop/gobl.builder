import type { BuilderContext } from "$lib/types/editor";
import type { GOBLError } from "@invopop/gobl-worker";
import { getContext, setContext } from "svelte";
import { derived, get, writable, type Writable } from "svelte/store";
import type * as monaco from "monaco-editor";
import { objectHasEmptyProperties } from "$lib/helpers/notification";
import { writableDerived } from "./writableDerived";
import { getUIModel, type UIModelRootField } from "$lib/editor/form/utils/model";
import { getDebouncedFunction } from "$lib/editor/form/utils/debounce";
import type { Envelope } from "$lib/types/envelope";
import { newEnvelope } from "$lib/helpers/envelope";

const BUILDER_CONTEXT_ID = "builder-context";

export function createBuilderContext(): BuilderContext {
  const formUniqueId = `form-${Math.random().toString(36).slice(2, 7)}`;

  /** -- MAIN STORES -- */
  const envelope = writable<Envelope>(newEnvelope(null));
  const keypair = writable(null);
  const goblError = writable<GOBLError | null>(null);
  const editorProblems = writable<monaco.editor.IMarker[]>([]);
  const jsonSchema = writable<string | null>(null);
  const recreatingUiModel = writable(false);
  const undoAvailable = writable(false);
  const redoAvailable = writable(false);
  const activeSection = writable<{ section: null | string; scroll: boolean }>({ section: null, scroll: false });
  const activeItem = writable<null | string>(null);
  const highlightedItem = writable<null | string>(null);
  const scrollingSection = writable(false);

  // editor represents the stringified JSON content in the editor
  const editor: Writable<{
    updatedAt: number;
    value: string;
  }> = writable({ updatedAt: 0, value: "" });

  /** -- DERIVED STORES -- */

  const envelopeIsSigned = derived(envelope, ($envelope) => Boolean($envelope?.sigs));

  // editorJSON represents the JSON content in the editor parsed as an object
  const editorJSON = derived(editor, ($editor) => {
    if (!$editor.value) return $editor;

    let value;

    try {
      value = JSON.parse($editor.value);
    } catch (e) {
      value = e as Error;
    }

    return {
      ...$editor,
      value,
    };
  });

  // Whether the editor content is a valid JSON and matches with the current JSON schema
  const validEditor = derived([jsonSchema, editor], ([$jsonSchema, $editor]) => {
    try {
      const parsed = JSON.parse($editor.value || "");
      if ($jsonSchema && parsed.$schema !== $jsonSchema) {
        return false;
      }
    } catch (e) {
      return false;
    }

    return true;
  });

  const currentEditorSchema = derived(editorJSON, ($editor) => {
    // eslint-disable-next-line
    return ($editor.value as any).$schema as string;
  });

  const someEditorValueIsEmpty = derived(editorJSON, ($editor) => {
    if (!$editor.value) return false;

    return objectHasEmptyProperties($editor.value as Record<string, unknown>);
  });

  const uiModel = writableDerived(
    jsonSchema,
    ($schema, set) => {
      debouncedRecreateUIModel($schema, set);
    },
    { value: undefined as UIModelRootField | undefined, updatedAt: 0 },
  );

  const documentHeaders = derived(uiModel, ($uiModel) => {
    const fields = $uiModel.value;

    if (!fields) return [];

    const rootKey = fields.key;
    const root = { slug: fields.id, label: `${rootKey.charAt(0).toUpperCase()}${rootKey.slice(1)}`, active: true };
    const items =
      fields.children
        ?.filter((f) => ["object", "array"].includes(f.type))
        .map((f) => ({
          slug: f.id,
          label: f.schema.title || "",
          active: false,
        })) || [];

    items.unshift(root);

    return items;
  });

  /** -- METHODS -- */

  async function updateSchema(value: string) {
    const parsedValue = get(editor).value ? JSON.parse(get(editor).value) : {};
    parsedValue.$schema = value;
    editor.set({ value: JSON.stringify(parsedValue, null, 4), updatedAt: Date.now() });
    jsonSchema.set(value);
  }

  /** -- HELPER FUNCTIONS -- */

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

  function recreateEditor() {
    const temp = get(jsonSchema);
    jsonSchema.set(null);
    jsonSchema.set(temp);
  }

  return setContext<BuilderContext>(BUILDER_CONTEXT_ID, {
    envelope,
    keypair,
    goblError,
    editorProblems,
    jsonSchema,
    editor,
    editorJSON,
    validEditor,
    currentEditorSchema,
    someEditorValueIsEmpty,
    uiModel,
    recreatingUiModel,
    updateSchema,
    envelopeIsSigned,
    undoAvailable,
    redoAvailable,
    activeSection,
    activeItem,
    highlightedItem,
    scrollingSection,
    documentHeaders,
    recreateEditor,
  });
}

export function getBuilderContext(): BuilderContext {
  return getContext<BuilderContext>(BUILDER_CONTEXT_ID);
}
