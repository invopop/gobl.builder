<script lang="ts">
  import hash from "object-hash";
  import { createEventDispatcher } from "svelte";
  import {
    editor,
    envelope,
    goblError,
    keypair,
    newEnvelope,
    editorProblems,
    jsonSchema,
    validEditor,
  } from "$lib/editor/stores.js";
  import MenuBar from "./menubar/MenuBar.svelte";
  import Editor from "./editor/Editor.svelte";
  import { isEnvelope } from "@invopop/gobl-worker";
  import { EditorProblemSeverity, problemSeverityMap, type EditorProblem } from "./editor/EditorProblem.js";

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

  // Binding this prop from outside will show if the envelope has been built
  export let built = false;

  // Binding this prop from outside will show if the editor has been modified
  export let modified = false;

  // Binding this prop from outside will show if the editor has any errors
  export let errored = false;

  // Binding this prop from outside will show if the envelope is signed
  export let signed = false;

  // Problems is an array of Monaco Editor problem markers. It can be used
  // upstream to keep track of the validity of the GOBL document.
  export let problems: EditorProblem[] = [];

  // When enabled, a "Sign" action is available. A client-only keypair is
  // generated and used for signing GOBL documents.
  export let signEnabled = true;

  let initialEditorData = "";

  if (signEnabled) {
    keypair.create().then((keypair) => {
      console.log("Created keypair.", keypair);
    });
  }
  $: hasErrors = !!problems.find((problem) => problem.severity === EditorProblemSeverity.Error);
  $: errored = !$validEditor || hasErrors;
  $: {
    try {
      const editorValue = $editor ? hash(JSON.parse($editor)) : "";
      modified = editorValue !== initialEditorData;
      // Reset gobl errors to do a clean validation
      goblError.set(null);
    } catch (error) {
      // Allow invalid json entered
      modified = true;
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
      } else {
        $envelope = newEnvelope(parsedValue);
      }

      initialEditorData = parsedValue ? hash(parsedValue) : "";
    } catch (e) {
      console.error("invalid document data: ");
      $envelope = newEnvelope(null);
    }
  }

  // Dispatch all `change` events when the envelope is built.
  envelope.subscribe((envelope) => {
    signed = Boolean(envelope?.sigs);
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
    built = !result?.error;
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
    <MenuBar on:change on:undo on:redo on:clear on:preview on:download />
  </div>
  <div class="flex-1 overflow-hidden">
    <Editor {jsonSchemaURL} />
  </div>
</div>
