<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { editor, envelope, envelopeAndEditorJSON, keypair } from "$lib/gobl/stores.js";
  import MenuBar from "./menubar/MenuBar.svelte";
  import Editor from "./editor/Editor.svelte";
  import { isEnvelope } from "./gobl/index.js";
  import { problemSeverityMap, type EditorProblem } from "./editor/EditorProblem.js";
  import { editorProblems } from "./editor/store.js";

  const dispatch = createEventDispatcher();

  // Used for JSON Schema validation within Monaco Editor. When set, this should
  // be the JSON Schema URL of a GOBL document, e.g. an invoice. Not an envelope.
  export let jsonSchemaURL = "";

  // Data is used for setting editor contents. Note: there is "one way" binding;
  // e.g. you can set data but changes are not bound to the parent. Use the
  // `change` event, to receive changes to the editor contents and GOBL
  // envelope.
  export let data = "";

  // Problems is an array of Monaco Editor problem markers. It can be used
  // upstream to keep track of the validity of the GOBL document.
  export let problems: EditorProblem[] = [];

  // When enabled, a "Sign" action is available. A client-only keypair is
  // generated and used for signing GOBL documents.
  export let signEnabled = true;

  if (signEnabled) {
    keypair.create().then((keypair) => {
      console.log("Created keypair.", keypair);
    });
  }

  // When `data` is updated, update the internal editor and envelope stores.
  // If `data` is JSON and it's a GOBL envelope, parse and store its contents
  // and the envelope separately.
  $: {
    try {
      const parsedValue = JSON.parse(data);
      if (isEnvelope(parsedValue)) {
        // Set new editor value *first*, because when the envelope is set, the Monaco
        // editor if the envelope contains signatures.
        $editor = JSON.stringify(parsedValue.doc, null, 4);
        $envelope = parsedValue;
      } else {
        $editor = data;
        $envelope = null;
      }
    } catch (e) {
      $editor = data;
      $envelope = null;
    }
  }

  // The `change` event is dispatched when the envelope or editor is updated.
  // When the editor contains invalid JSON, envelope is always `null`. The editor
  // value is always passed along as-is; e.g. without any parsing.
  envelopeAndEditorJSON.subscribe(([envelope, editor]) => {
    dispatch("change", {
      envelope,
      editor,
    });
  });

  // This ensures the current error state of the editor is bound to the
  // `hasErrors` property.
  editorProblems.subscribe((items) => {
    problems = items.map((problem) => ({
      message: problem.message,
      severity: problemSeverityMap[problem.severity],
    }));
  });
</script>

<div class="flex flex-col h-full">
  <div class="flex-none">
    <MenuBar
      {jsonSchemaURL}
      {signEnabled}
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

<style>
  @import "@fontsource/fira-code";
</style>
