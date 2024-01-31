<script lang="ts">
  import * as GOBL from "@invopop/gobl-worker";
  import { ToastContainer, toasts } from "svelte-toasts";
  import hash from "object-hash";
  import { createEventDispatcher } from "svelte";
  import {
    envelope,
    editorProblems,
    jsonSchema,
    envelopeDocumentJSON,
    editor,
    envelopeIsSigned,
  } from "$lib/editor/stores.js";
  import EditorCode from "./editor/code/EditorCode.svelte";
  import EditorForm from "./editor/form/EditorForm.svelte";
  import { isEnvelope } from "@invopop/gobl-worker";
  import { problemSeverityMap, type EditorProblem } from "./editor/EditorProblem.js";
  import * as actions from "./editor/actions";
  import { schemaUrlForm } from "./editor/form/context/formEditor";
  import type { State } from "./types/editor";
  import { displayAllErrors, showErrorToast } from "./helpers";
  import { generateCorrectOptionsModel, type UIModelField } from "./editor/form/utils/model";
  import EditorFormModalSignatures from "./editor/form/modals/EditorFormModalSignatures.svelte";
  import EditorFormModalHeaders from "./editor/form/modals/EditorFormModalHeaders.svelte";
  import EditorFormModalCorrect from "./editor/form/modals/EditorFormModalCorrect.svelte";
  import fileSaver from "file-saver";
  import SuccessToastIcon from "./ui/icons/SuccessToastIcon.svelte";
  import ErrorToastIcon from "./ui/icons/ErrorToastIcon.svelte";
  import type { Envelope } from "./types/envelope";
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

  let editorForm: EditorForm | null = null;
  let openCorrectModal = false;
  let openHeadersModal = false;
  let openSignaturesModal = false;
  let correctionModel: UIModelField | undefined;
  let initialEditorData = "";

  const builderContext = createBuilderContext();
  const { keypair, goblError } = builderContext;

  if (signEnabled) {
    GOBL.keygen().then((k) => {
      $keypair = k;
      console.log("Created keypair.", k);
    });
  }

  // jsonSchema is stored for validations in code editor
  $: jsonSchema.set(jsonSchemaURL);

  // schemaUrlForm is stored for recreating UI model
  $: schemaUrlForm.set(jsonSchemaURL);

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
    goblError.set(null);
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

  // This ensures the current error state of the editor is bound to the
  // `hasErrors` property.
  editorProblems.subscribe((items) => {
    problems = items.map((problem) => ({
      message: problem.message,
      severity: problemSeverityMap[problem.severity],
    }));
  });

  const setState = (editorValue: string) => {
    if (!editorValue) {
      state = "empty";
      return;
    }

    if (editorValue !== initialEditorData) {
      state = "modified";
      return;
    }

    state = $envelope?.sigs ? "signed" : "loaded";
  };

  // Exposed functions to perform the actions from outside
  export const build = async (): Promise<State> => {
    const result = await actions.build(builderContext);
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

  export const correct = async () => {
    const result = await actions.getCorrectionOptionsSchema(builderContext);

    if (!result?.schema) {
      state = "errored";
      showErrorToast("This document can not be corrected.");
      return;
    }

    correctionModel = await generateCorrectOptionsModel(result?.schema || "");
    openCorrectModal = true;
  };

  export const correctWithOptions = async (options: string) => {
    const result = await actions.correct(options, builderContext);

    if (result?.error) {
      state = "errored";
      displayAllErrors(result?.error?.message || "");
      return;
    }

    openCorrectModal = false;

    state = "corrected";

    if (!editorForm) return;

    editorForm.recreateFormEditor();
  };

  export const sign = async () => {
    if (!keypair) return;

    const result = await actions.sign(builderContext);
    dispatch("sign", result);
  };

  export const validate = async () => {
    const result = await actions.validate(builderContext);
    dispatch("validate", result);
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
    if (parsedValue?.$schema === $schemaUrlForm) {
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

  export const showHeaders = async () => {
    openHeadersModal = true;
  };

  export const showSignatures = async () => {
    if (!$envelopeIsSigned) {
      return;
    }

    openSignaturesModal = true;
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
</script>

<div class="@container flex flex-col h-full editor">
  <div class="flex-1 overflow-hidden">
    <div class="flex flex-col h-full">
      <div class="relative flex-1 overflow-hidden">
        <div class="h-full absolute inset-0">
          {#if editorView === "code"}
            <EditorCode {jsonSchemaURL} {forceReadOnly} />
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
</div>

{#if openCorrectModal}
  <EditorFormModalCorrect
    bind:correctionModel
    on:close={() => {
      openCorrectModal = false;
    }}
    on:correct={() => {
      correctWithOptions(correctionModel?.root.toJSON() || "");
    }}
  />
{/if}

{#if openHeadersModal}
  <EditorFormModalHeaders
    on:close={() => {
      openHeadersModal = false;
    }}
  />
{/if}

{#if openSignaturesModal}
  <EditorFormModalSignatures
    on:close={() => {
      openSignaturesModal = false;
    }}
  />
{/if}

<ToastContainer let:data placement="bottom-right" width="" duration={3000}>
  <div class="bg-neutral-800 rounded">
    <div
      class="{data.type === 'success' ? 'from-positive-500/30' : ''} {data.type === 'error'
        ? 'from-danger-500/30'
        : ''} py-[7px] pl-2 pr-3 flex space-x-1 bg-opacity-30 bg-gradient-to-r via-transparent to-transparent rounded"
    >
      <div class="flex-nowrap">
        {#if data.type === "success"}
          <SuccessToastIcon />
        {:else if data.type === "error"}
          <ErrorToastIcon />
        {/if}
      </div>
      <p class="text-white font-medium text-sm">{data.description}</p>
    </div>
  </div>
</ToastContainer>
