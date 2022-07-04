<script lang="ts">
  import * as monaco from "monaco-editor";
  import JSONWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

  import { onMount } from "svelte";
  import { editor } from "./stores";

  let editorEl: HTMLElement;
  let monacoEditor: monaco.editor.IStandaloneCodeEditor;

  onMount(() => {
    self.MonacoEnvironment = {
      getWorker: function (_: string, label: string) {
        switch (label) {
          case "json":
            return new JSONWorker();
          default:
            return new EditorWorker();
        }
      },
    };

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({ validate: true, enableSchemaRequest: true });

    monacoEditor = monaco.editor.create(editorEl, {
      language: "json",
      minimap: {
        enabled: false,
      },
      scrollBeyondLastLine: false,
    });

    editor.subscribe((value) => {
      // To keep undo/redo in the editor working, only overwrite the model
      // contents when the current editor model value isn't the same as the new
      // store value.
      if (monacoEditor.getValue() !== value) {
        monacoEditor.setValue(value);
      }
    });

    monacoEditor.onDidChangeModelContent(() => {
      editor.set(monacoEditor.getValue());
    });
  });
</script>

<div id="monaco-editor" bind:this={editorEl} />

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
