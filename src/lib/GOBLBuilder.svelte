<script lang="ts">
  import hash from "object-hash";
  import { createEventDispatcher } from "svelte";
  import {
    envelope,
    goblError,
    keypair,
    newEnvelope,
    editorProblems,
    jsonSchema,
    validEditor,
    envelopeDocumentJSON,
    editor,
  } from "$lib/editor/stores.js";
  import MenuBar from "./menubar/MenuBar.svelte";
  import EditorCode from "./editor/code/EditorCode.svelte";
  import EditorForm from "./editor/form/EditorForm.svelte";
  import { isEnvelope } from "@invopop/gobl-worker";
  import { problemSeverityMap, type EditorProblem } from "./editor/EditorProblem.js";
  import * as actions from "./editor/actions";
  import { schemaUrlForm } from "./editor/form/context/formEditor";
  import type { State } from "./types/editor";

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
  // init: the app is starting, show a loading thing
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
  let editorView = "code";
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
      let parsedValue = null;
      if (data != "") {
        parsedValue = JSON.parse(data);
      }

      if (data != "" && isEnvelope(parsedValue)) {
        $envelope = parsedValue;
        initialEditorData = hash(parsedValue.doc);
      } else {
        $envelope = newEnvelope(parsedValue);
        initialEditorData = hash(parsedValue || "");
      }
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
  export const build = async () => {
    const result = await actions.build();
    dispatch("build", result);
    if (result?.error) {
      state = "errored";
    } else {
      state = "built";
    }
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
</script>

<div class="flex flex-col h-full editor">
  <div class="flex-none">
    <MenuBar bind:editorView on:change on:undo on:redo on:clear on:preview on:download />
  </div>
  <div class="flex-1 overflow-hidden">
    <div class="flex flex-col h-full">
      <div class="relative flex-1 overflow-hidden">
        <div class="h-full absolute inset-0">
          {#if editorView === "code"}
            <EditorCode {jsonSchemaURL} />
          {:else}
            <EditorForm />
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
