<script lang="ts">
  import * as monaco from "monaco-editor";
  import JSONWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

  import { onMount } from "svelte";
  import { editor } from "./stores";
  import EditorProblem from "./EditorProblem.svelte";

  let editorEl: HTMLElement;
  let monacoEditor: monaco.editor.IStandaloneCodeEditor;
  let problems: monaco.editor.IMarker[] = [];

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

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      enableSchemaRequest: true,
      schemaValidation: "error",
    });

    monacoEditor = monaco.editor.create(editorEl, {
      value: "Foobar",
      language: "json",
      minimap: {
        enabled: false,
      },
      scrollBeyondLastLine: false,
      automaticLayout: true,
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

    monaco.editor.onDidChangeMarkers(() => {
      problems = monaco.editor.getModelMarkers({});
    });
  });

  function handleProblemClick(problem: monaco.editor.IMarker) {
    return function () {
      monacoEditor.setPosition({ lineNumber: problem.startLineNumber, column: problem.startColumn });
      monacoEditor.revealLineInCenter(problem.startLineNumber);
    };
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex-1 overflow-hidden" bind:this={editorEl} />
  <div class="flex-none h-36 py-3 overflow-auto border-t-2">
    {#if problems.length === 0}
      <p class="text-sm text-green-600 ml-4">No problems detected.</p>
    {/if}
    <ul>
      {#each problems as problem}
        <li class="block cursor-pointer px-4 py-1 hover:bg-slate-100" on:click={handleProblemClick(problem)}>
          <EditorProblem {problem} />
        </li>
      {/each}
    </ul>
  </div>
</div>
