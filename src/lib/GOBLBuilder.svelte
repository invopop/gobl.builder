<script lang="ts">
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

  const dispatch = createEventDispatcher();

  // Used for JSON Schema validation within Monaco Editor. When set, this should
  // be the JSON Schema URL of a GOBL document, e.g. an invoice. Not an envelope.
  export let jsonSchemaURL = "";

  // Schema is stored for validation
  $jsonSchema = jsonSchemaURL;

  // Data is used for setting editor contents. Note: there is "one way" binding;
  // e.g. you can set data but changes are not bound to the parent. Use the
  // `change` event, to receive changes to the editor contents and GOBL
  // envelope.
  export let data = "";

  // Binding this prop from outside will show if the editor is valid
  export let isValid = false;

  // Binding this prop from outside will show if the envelope is signed
  export let isSigned = false;

  // Problems is an array of Monaco Editor problem markers. It can be used
  // upstream to keep track of the validity of the GOBL document.
  export let problems: EditorProblem[] = [];

  // When enabled, a "Sign" action is available. A client-only keypair is
  // generated and used for signing GOBL documents.
  export let signEnabled = true;

  // Whether shows the code or the form editor
  let editorView = "code";

  if (signEnabled) {
    keypair.create().then((keypair) => {
      console.log("Created keypair.", keypair);
    });
  }

  $: editor.set({ value: envelopeDocumentJSON($envelope), updatedAt: Date.now() });

  $: isValid = $validEditor;

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
      } else {
        $envelope = newEnvelope(parsedValue);
      }
    } catch (e) {
      console.error("invalid document data: ");
      $envelope = newEnvelope(null);
    }
  }

  // Dispatch all `change` events when the envelope is modified.
  envelope.subscribe((envelope) => {
    isSigned = Boolean(envelope?.sigs);
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

  // Exposed functions to perform the actions from outside
  export const build = async () => {
    const result = await actions.build();
    dispatch("build", result);
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
            <EditorForm {jsonSchemaURL} />
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
