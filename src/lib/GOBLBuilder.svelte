<script lang="ts">
  import { editor, editorProblems, envelope, envelopeOrDocJSON } from "$lib/stores.js";
  import MenuBar from "./menubar/MenuBar.svelte";
  import Editor from "./editor/Editor.svelte";
  import { isEnvelope } from "./gobl.js";
  import { problemSeverityMap, type EditorProblem } from "./editor/EditorProblem.js";

  // Used for JSON Schema validation within Monaco Editor. When set, this should
  // be the JSON Schema URL of a GOBL document, e.g. an invoice. Not an envelope.
  export let jsonSchemaURL = "";

  // Data is used for setting editor contents. It allows for two way component
  // binding. E.g. when the editor contents are changed, this property is also
  // updated.
  export let data = "";

  // Problems is an array of Monaco Editor problem markers. It can be used
  // upstream to keep track of the validity of the GOBL document.
  export let problems: EditorProblem[] = [];

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
        $editor = JSON.stringify(parsedValue, null, 4);
        $envelope = null;
      }
    } catch (e) {
      $editor = data;
      $envelope = null;
    }
  }

  // This ensures envelope or editor changes are bound to the `data` property.
  envelopeOrDocJSON.subscribe((value) => {
    // Null means we cannot safely propagate the data to the parent component,
    // i.e. there's an envelope but the editor contains invalid JSON.
    if (value !== null) {
      data = value;
    }
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
    <MenuBar {jsonSchemaURL} on:undo on:redo on:clear on:build on:sign on:validate on:preview on:download />
  </div>
  <div class="flex-1 overflow-hidden">
    <Editor {jsonSchemaURL} />
  </div>
</div>

<style>
  @import "@fontsource/fira-code";
</style>
