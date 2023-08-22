<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { envelope, goblError, keypair, newEnvelope } from "$lib/editor/stores.js";
  import MenuBar from "./menubar/MenuBar.svelte";
  import Editor from "./editor/Editor.svelte";
  import { isEnvelope } from "@invopop/gobl-worker";
  import { problemSeverityMap, type EditorProblem } from "./editor/EditorProblem.js";
  import { editorProblems, jsonSchema, validEditor, envelopeIsSigned } from "./editor/stores.js";

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

  // When enabled, actions buttons such as Build, Sign and Validate are hidden. The underlying actions
  // that they fire can be still executed from outside.
  export let hideActionButtons = false;

  // Menu instance to be able to call functions from outside
  let menu: MenuBar;

  if (signEnabled) {
    keypair.create().then((keypair) => {
      console.log("Created keypair.", keypair);
    });
  }

  $: {
    isValid = $validEditor;
    isSigned = $envelopeIsSigned;
  }

  // When `data` is updated, update the internal envelope store.
  // If required instantiate a new envelope object to use.
  $: {
    goblError.set(null);
    // isValid = $validEditor;
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
  export const build = () => menu.build();
  export const sign = () => {
    if (!signEnabled) return;
    menu.sign();
  };
  export const validate = () => menu.validate();
</script>

<div class="flex flex-col h-full editor">
  <div class="flex-none">
    <MenuBar
      bind:this={menu}
      {signEnabled}
      {hideActionButtons}
      on:change
      on:undo
      on:redo
      on:clear
      on:build
      on:sign
      on:validate
      on:preview
      on:download
    />
  </div>
  <div class="flex-1 overflow-hidden">
    <Editor {jsonSchemaURL} />
  </div>
</div>
