<script lang="ts">
  import * as monaco from "monaco-editor";
  import JSONWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

  import { onDestroy, onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { editor, draft } from "./stores";
  import EditorProblem from "./EditorProblem.svelte";

  let editorEl: HTMLElement;
  let monacoEditor: monaco.editor.IStandaloneCodeEditor;
  let problems: monaco.editor.IMarker[] = [];
  let lineNumber = 1;
  let column = 1;
  let drawerClosed = false;

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
      theme: "vs-dark",
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

    monacoEditor.onDidChangeCursorPosition((event) => {
      lineNumber = event.position.lineNumber;
      column = event.position.column;
    });
  });

  onDestroy(() => {
    monacoEditor.dispose();
  });

  function handleProblemClick(problem: monaco.editor.IMarker) {
    return function () {
      monacoEditor.setPosition({ lineNumber: problem.startLineNumber, column: problem.startColumn });
      monacoEditor.revealLineInCenter(problem.startLineNumber);
    };
  }
  function handleDrawerToggle() {
    drawerClosed = !drawerClosed;
  }
</script>

<div class="flex flex-col h-full bg-black">
  <div class="flex-1 overflow-hidden" bind:this={editorEl} />

  <div
    class="flex-none px-4 py-2 bg-zinc-700 text-white text-sm border-b-gray-600 flex gap-6"
    on:dblclick={handleDrawerToggle}
  >
    <div>
      <span class="mr-1">{problems.length > 0 ? "❌" : "✅"}</span>
      {problems.length}
      {problems.length === 1 ? "error" : "errors"}
    </div>
    <div class="flex-1">
      <span class="mr-1">{$draft ? "✍️" : "🔏"}</span>
      {$draft ? "Draft" : "Signed"}
    </div>
    <div>Ln {lineNumber}, Col {column}</div>
    <span class="cursor-pointer" on:click={handleDrawerToggle}>{drawerClosed ? "🔼" : "⬇️"}</span>
  </div>

  {#if !drawerClosed}
    <div
      class="flex-none h-36 py-3 overflow-auto font-mono text-xs text-white bg-zinc-800"
      transition:slide={{ duration: 300 }}
    >
      {#if $editor === ""}
        <p class="m-4">💡 To get started, choose a template from the menu bar.</p>
      {/if}
      {#if $editor !== "" && problems.length === 0}
        <p class="m-4">💡 Use the action buttons in the menu bar.</p>
      {/if}
      <ul>
        {#each problems as problem}
          <li class="block cursor-pointer px-4 py-1 hover:bg-zinc-700" on:click={handleProblemClick(problem)}>
            <EditorProblem {problem} />
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
