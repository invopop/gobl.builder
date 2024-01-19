<script lang="ts">
  import { ToastContainer, toasts } from "svelte-toasts";
  import hash from "object-hash";
  import { SvelteComponent, createEventDispatcher } from "svelte";
  import {
    envelope,
    goblError,
    keypair,
    newEnvelope,
    editorProblems,
    jsonSchema,
    envelopeDocumentJSON,
    editor,
    type Envelope,
    envelopeIsSigned,
  } from "$lib/editor/stores.js";
  // import MenuBar from "./menubar/MenuBar.svelte";
  import EditorCode from "./editor/code/EditorCode.svelte";
  import EditorForm from "./editor/form/EditorForm.svelte";
  import { isEnvelope } from "@invopop/gobl-worker";
  import { problemSeverityMap, type EditorProblem } from "./editor/EditorProblem.js";
  import * as actions from "./editor/actions";
  import { schemaUrlForm } from "./editor/form/context/formEditor";
  import type { State } from "./types/editor";
  import { displayAllErrors, showErrorToast } from "./helpers";
  import Modal from "./ui/Modal.svelte";
  import DynamicForm from "./editor/form/DynamicForm.svelte";
  import { generateCorrectOptionsModel, type UIModelField } from "./editor/form/utils/model";
  import BaseButton from "./ui/BaseButton.svelte";
  import { Edit } from "@invopop/ui-icons";
  import EnvelopeSignatures from "./menubar/EnvelopeSignatures.svelte";
  import EnvelopeHeader from "./menubar/EnvelopeHeader.svelte";
  import fileSaver from "file-saver";

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
  let openModal = false;
  let openHeadersModal = false;
  let modalComponent: typeof SvelteComponent | null = null;
  let modalTitle = "";
  let correctionModel: UIModelField | undefined;
  let initialEditorData = "";

  if (signEnabled) {
    keypair.create().then((keypair) => {
      console.log("Created keypair.", keypair);
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
    const result = await actions.build();
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
    const result = await actions.getCorrectionOptionsSchema();

    if (!result?.schema) {
      state = "errored";
      showErrorToast("This document can not be corrected.");
      return;
    }

    correctionModel = await generateCorrectOptionsModel(result?.schema || "");
    openModal = true;
  };

  export const correctWithOptions = async (options: string) => {
    const result = await actions.correct(options);

    if (result?.error) {
      state = "errored";
      displayAllErrors(result?.error?.message || "");
      return;
    }

    openModal = false;

    state = "corrected";

    if (!editorForm) return;

    editorForm.recreateFormEditor();
  };

  export const sign = async () => {
    if (!signEnabled) return;
    const result = await actions.sign();
    dispatch("sign", result);
  };

  export const validate = async () => {
    const result = await actions.validate();
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
      if (!envelopeValue?.doc) return;

      build();
    }, 100);
  };

  export const recreateVisualEditor = async () => {
    if (!editorForm) return;

    editorForm.recreateFormEditor();
  };

  export const showHeaders = async () => {
    openHeadersModal = true;
    modalComponent = EnvelopeHeader as typeof SvelteComponent;
    modalTitle = "Header";
  };

  export const showSignatures = async () => {
    if (!$envelopeIsSigned) {
      return;
    }

    openHeadersModal = true;
    modalComponent = EnvelopeSignatures as typeof SvelteComponent;
    modalTitle = "Signatures";
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

<div class="flex flex-col h-full editor">
  <!-- <div class="flex-none">
    <MenuBar bind:editorView on:change on:undo on:redo />
  </div> -->
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

{#if openModal}
  <div>
    <div class="bg-black bg-opacity-70 fixed inset-0 z-40" />
    <Modal
      title="Correct"
      on:close={() => {
        openModal = false;
      }}
    >
      <DynamicForm model={correctionModel} on:uiRefreshNeeded={(event) => (correctionModel = event.detail)} />
      <div slot="footer" class="flex space-x-3">
        <BaseButton
          on:click={() => {
            openModal = false;
          }}
        >
          Cancel
        </BaseButton>
        <BaseButton
          icon={Edit}
          variant="primary"
          on:click={() => correctWithOptions(correctionModel?.root.toJSON() || "")}
        >
          Correct
        </BaseButton>
      </div>
    </Modal>
  </div>
{/if}

{#if openHeadersModal}
  <div>
    <div class="bg-black bg-opacity-70 fixed inset-0 z-40" />
    <Modal title={modalTitle} on:close={() => (openHeadersModal = false)}>
      <svelte:component this={modalComponent} />
      <BaseButton
        slot="footer"
        on:click={() => {
          openHeadersModal = false;
        }}
      >
        Cancel
      </BaseButton>
    </Modal>
  </div>
{/if}

<ToastContainer let:data placement="top-center" duration={3000}>
  <div
    class:border-positive-500={data.type === "success"}
    class:border-danger-500={data.type === "error"}
    class="bg-white border border-positive-500 py-[7px] pl-2 pr-3 flex space-x-1 rounded shadow-lg"
  >
    {#if data.type === "error"}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM7.99999 9.35C7.66862 9.35 7.39999 9.08137 7.39999 8.75V4.75C7.39999 4.41863 7.66862 4.15 7.99999 4.15C8.33137 4.15 8.59999 4.41863 8.59999 4.75L8.59999 8.75C8.59999 9.08137 8.33136 9.35 7.99999 9.35ZM8.75 11C8.75 11.4142 8.41421 11.75 8 11.75C7.58579 11.75 7.25 11.4142 7.25 11C7.25 10.5858 7.58579 10.25 8 10.25C8.41421 10.25 8.75 10.5858 8.75 11Z"
          fill="#EC4E46"
        />
      </svg>
    {:else}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="7" fill="#3FC275" />
        <path d="M11 5L7 10.6842L5 8.64719" stroke="white" />
      </svg>
    {/if}
    <p class="text-neutral-800 font-medium text-sm">{data.description}</p>
  </div>
</ToastContainer>
