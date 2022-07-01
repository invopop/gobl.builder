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
      value: $editor,
      language: "json",
      minimap: {
        enabled: false,
      },
    });

    monacoEditor.onDidChangeModelContent(() => {
      editor.set(monacoEditor.getValue());
    });
  });

  editor.subscribe((value) => {
    if (monacoEditor) {
      monacoEditor.setValue(value);
    }
  });
</script>

<div id="monaco-editor" bind:this={editorEl} />

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
