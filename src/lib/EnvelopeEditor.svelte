<script lang="ts">
  import * as GOBL from "@invopop/gobl-worker";
  import { toasts } from "svelte-toasts";
  import hash from "object-hash";
  import { createEventDispatcher } from "svelte";
  import { envelopeDocumentJSON } from "$lib/helpers/envelope";
  import EditorCode from "./editor/code/EditorCode.svelte";
  import EditorForm from "./editor/form/EditorForm.svelte";
  import { isEnvelope } from "@invopop/gobl-worker";
  import { problemSeverityMap, type EditorProblem } from "./editor/EditorProblem.js";
  import * as actions from "./editor/actions";
  import type { BuildOptions, DocumentHeader, State } from "./types/editor";
  import { displayAllErrors, showErrorToast } from "./helpers";
  import { generateCorrectOptionsModel } from "./editor/form/utils/model";
  import fileSaver from "file-saver";
  import type { Envelope, EnvelopeHeader } from "./types/envelope";
  import { newEnvelope } from "./helpers/envelope";
  import { createBuilderContext } from "./store/builder";

  const dispatch = createEventDispatcher();

  // Used for JSON Schema validation within Monaco Editor. When set, this should
  // be the JSON Schema URL of a GOBL document, e.g. an invoice. Not an envelope.
  export let jsonSchemaURL = "";

  // Data is used for setting editor contents. Note: there is "one way" binding;
  // e.g. you can set data but changes are not bound to the parent. Use the
  // `change` event, to receive changes to the editor contents and GOBL
  // envelope.
  export let data = "";

  // Binding this prop from outside will show the state of the editor. Posible values:
  // init: the app is starting
  // empty: there is no content
  // loaded: implies that a document was loaded and no further action has been taken yet
  // modified: something is being changed
  // invalid: there are syntax errors, cannot be built
  // errored: build was attempted, but failed
  // built: document has been built, is valid, and can be modified again
  // signed: signature applied, main content is now read-only, headers could still be modified, but we don't need to worry about that yet
  export let state: State = "init";

  // Problems is an array of Monaco Editor problem markers. It can be used
  // upstream to keep track of the validity of the GOBL document.
  export let problems: EditorProblem[] = [];

  // When enabled, a "Sign" action is available. A client-only keypair is
  // generated and used for signing GOBL documents.
  export let signEnabled = true;

  // Whether shows the code or the form editor
  export let editorView = "code";

  // When enabled, it sets the editor as readOnly even if the document is not signed
  export let forceReadOnly = false;

  // Expose document headers to navigate to a specific section from outside
  export let headers: DocumentHeader[] = [];

  // Expose activeHeader
  export let activeHeader: DocumentHeader | undefined = undefined;

  // If autocorrect is set to false the envelope is not updated automatically. Event `corrected` is always fired with the result
  export let autocorrect = true;

  // If hideConsoleBar is true will force to hide the error suggestions in Code View
  export let hideConsoleBar = false;

  let editorForm: EditorForm | null = null;
  let initialEditorData = "";

  const builderContext = createBuilderContext();

  const { editor, jsonSchema, envelope, envelopeIsSigned, activeSection, documentHeaders } = builderContext;

  if (signEnabled) {
    GOBL.keygen().then((k) => {
      builderContext.keypair.set(k);
      console.log("Created keypair.", k);
    });
  }

  // jsonSchema is stored for validations in code editor
  $: jsonSchema.set(jsonSchemaURL);

  $: editor.set({ value: envelopeDocumentJSON($envelope), updatedAt: Date.now() });

  $: {
    try {
      const editorValue = $editor ? hash(JSON.parse($editor.value)) : "";
      setState(editorValue);
    } catch (error) {
      // Allow invalid json entered
      state = "invalid";
    }
  }

  // When `data` is updated, update the internal envelope store.
  // If required instantiate a new envelope object to use.
  $: {
    builderContext.goblError.set(null);
    try {
      reloadData(data);
    } catch (e) {
      console.error("invalid document data: ", e);
      $envelope = newEnvelope(null);
      state = "empty";
    }
  }

  // Dispatch all `change` events when the envelope is built.
  envelope.subscribe((envelope) => {
    dispatch("change", { envelope: JSON.stringify(envelope) });
  });

  // This keeps problems array prop in sync with editor problems
  builderContext.editorProblems.subscribe((items) => {
    problems = items.map((problem) => ({
      message: problem.message,
      severity: problemSeverityMap[problem.severity],
    }));
  });

  // This keeps headers array prop in sync with document headers
  documentHeaders.subscribe((h) => {
    headers = h;
  });

  // This keeps activeHeader prop in sync with active section
  activeSection.subscribe((section) => {
    const header = $documentHeaders.find((h) => h.slug === section.section);

    if (header) {
      header.active = true;
    }

    activeHeader = header;
  });

  const setState = (editorValue: string) => {
    if (!editorValue) {
      state = "empty";
      return;
    }

    if ($envelope?.sigs) {
      state = "signed";
      return;
    }

    if (editorValue !== initialEditorData) {
      state = "modified";
      return;
    }

    state = "loaded";
  };

  // Exposed functions to perform the actions from outside
  export const build = async (options: BuildOptions = {}): Promise<State> => {
    const result = await actions.build(builderContext, options);
    dispatch("build", result);

    if (result?.error) {
      state = "errored";
    } else {
      state = "built";
    }

    if (!editorForm) return state;

    if (state === "built") {
      editorForm.recreateFormEditor();
      return state;
    }

    displayAllErrors(result?.error?.message || "");

    return state;
  };

  export const removeSigs = async (): Promise<State> => {
    if (!$envelope?.sigs) {
      return state;
    }
    return await build({ removeSignatures: true, removeStamps: true });
  };

  export const getCorrectionOptionsModel = async () => {
    const result = await actions.getCorrectionOptionsSchema(builderContext);

    if (!result?.schema) {
      state = "errored";
      showErrorToast("This document can not be corrected.");
      return;
    }

    return await generateCorrectOptionsModel(result?.schema || "");
  };

  export const correctWithOptions = async (options: string) => {
    const result = await actions.correct(options, builderContext, autocorrect);

    if (result?.error) {
      state = "errored";
      displayAllErrors(result?.error?.message || "");
      return false;
    }

    dispatch("correct", result);

    state = "corrected";

    if (!editorForm) return true;

    editorForm.recreateFormEditor();

    return true;
  };

  export const sign = async () => {
    if (!signEnabled) return;

    const result = await actions.sign(builderContext);
    dispatch("sign", result);

    // There is no need to set the state here as it is
    // handled by setState watcher. We return the value
    // to inform external caller
    if (result?.error) {
      displayAllErrors(result?.error?.message || "");
      return "errored";
    }

    return "signed";
  };

  export const validate = async () => {
    const result = await actions.validate(builderContext);
    dispatch("validate", result);
  };

  export const replicate = async () => {
    const result = await actions.replicate(builderContext);
    dispatch("replicate", result);
  };

  export const reloadData = async (d: string | null = null) => {
    let parsedValue = null;
    let envelopeValue: Envelope | null = null;
    let hashedData = "";
    const internalData = d || data;

    if (internalData != "") {
      parsedValue = JSON.parse(internalData);
    }

    if (internalData != "" && isEnvelope(parsedValue)) {
      envelopeValue = parsedValue;
      hashedData = hash(parsedValue.doc);
    } else {
      envelopeValue = newEnvelope(parsedValue);
      hashedData = hash(parsedValue || "");
    }

    if (initialEditorData === hashedData) {
      return;
    }

    $envelope = envelopeValue as Envelope;
    initialEditorData = hashedData;

    // Only applies to form view
    if (editorView === "code") return;

    // If document loaded has the same schema as previously loaded
    // We need to force a rebuild of the UI model
    if (parsedValue?.$schema === $jsonSchema) {
      recreateVisualEditor();
    }

    // Attemp autobuild after editor refreshes
    setTimeout(() => {
      if (forceReadOnly || !envelopeValue?.doc || $envelopeIsSigned) return;

      build();
    }, 100);
  };

  export const recreateVisualEditor = async () => {
    if (!editorForm) return;

    editorForm.recreateFormEditor();
  };

  export const getHeaders = async () => {
    return $envelope.head || null;
  };

  export const setHeaders = async (headers: EnvelopeHeader) => {
    if (!$envelope) return;

    $envelope.head = headers;
  };

  export const getSignatures = async () => {
    if (!$envelopeIsSigned) {
      return null;
    }

    return $envelope.sigs || null;
  };

  export const downloadJson = () => {
    if (!$envelope) {
      return;
    }

    const filename = ($envelope.head?.uuid || "gob") + ".json";
    fileSaver.saveAs(new Blob([JSON.stringify($envelope, null, 4)]), filename);

    toasts.add({
      type: "success",
      description: "Downloaded JSON file of GOBL document.",
    });
  };

  export const setActive = (header: DocumentHeader) => {
    $activeSection = {
      section: header.slug,
      scroll: true,
    };
  };

  export const getEditorValue = () => {
    return JSON.parse($editor.value);
  };
</script>

<div class="@container flex flex-col h-full">
  <div class="flex-1 overflow-hidden relative">
    <div class="h-full absolute inset-0 flex flex-col">
      <div class="flex-1 overflow-auto">
        {#if editorView === "code"}
          <EditorCode {hideConsoleBar} {jsonSchemaURL} {forceReadOnly} />
        {:else}
          <EditorForm
            bind:this={editorForm}
            {forceReadOnly}
            on:setState={(event) => {
              state = event.detail;
            }}
          />
        {/if}
      </div>
    </div>
  </div>
</div>
