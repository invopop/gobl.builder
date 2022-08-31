<script lang="ts">
  import * as monaco from "monaco-editor";
  import JSONWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
  import type { Environment } from "monaco-editor";

  import { onDestroy, onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { editor, goblError, redoAvailable, undoAvailable, envelope } from "$lib/stores.js";
  import EditorProblem from "./EditorProblem.svelte";
  import WarningIcon from "$lib/ui/WarningIcon.svelte";
  import ErrorIcon from "$lib/ui/ErrorIcon.svelte";
  import SuccessIcon from "$lib/ui/SuccessIcon.svelte";
  import LightbulbIcon from "$lib/ui/LightbulbIcon.svelte";

  let editorEl: HTMLElement;
  let monacoEditor: monaco.editor.IStandaloneCodeEditor;
  let problems: monaco.editor.IMarker[] = [];
  let lineNumber = 1;
  let column = 1;
  let drawerClosed = false;

  $: warningCount = problems.filter((problem) => problem.severity === monaco.MarkerSeverity.Warning).length;
  $: errorCount = problems.filter((problem) => problem.severity === monaco.MarkerSeverity.Error).length;

  onMount(() => {
    (<Environment>(self as any).MonacoEnvironment) = {
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
      schemaValidation: "warning",
    });

    monacoEditor = monaco.editor.create(editorEl, {
      value: "",
      language: "json",
      theme: "vs-dark",
      minimap: {
        enabled: false,
      },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      fontFamily: `ui-monospace, "Fira Code", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
      scrollbar: {
        useShadows: false,
      },
      padding: {
        top: 14,
        bottom: 14,
      },
    });

    const model = monacoEditor.getModel();
    if (!model) {
      return;
    }

    const initialVersion = model.getAlternativeVersionId();
    let currentVersion = initialVersion;
    let lastVersion = initialVersion;

    goblError.subscribe((goblErr) => {
      if (!goblErr) {
        monaco.editor.setModelMarkers(model, "gobl", []);
        return;
      }

      monaco.editor.setModelMarkers(model, "gobl", [
        {
          message: `${goblErr.message} (code: ${goblErr.code})`,
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1,
        },
      ]);
    });

    editor.subscribe((value) => {
      // To keep undo/redo in the editor working, only overwrite the model
      // contents when the current editor model value isn't the same as the new
      // store value.
      if (monacoEditor.getValue() === value) {
        return;
      }

      monacoEditor.executeEdits("gobl", [
        {
          range: model.getFullModelRange(),
          text: value,
          forceMoveMarkers: true,
        },
      ]);
      monacoEditor.pushUndoStop();
    });

    monacoEditor.onDidChangeModelContent(() => {
      editor.set(monacoEditor.getValue());

      const versionId = model.getAlternativeVersionId();
      if (versionId < currentVersion) {
        // Undo occured.
        redoAvailable.set(true);
        if (versionId === initialVersion) {
          // No more undo items.
          undoAvailable.set(false);
        }
      } else {
        if (versionId <= lastVersion) {
          // Redo occured.
          if (versionId == lastVersion) {
            // Redo of last change occured.
            redoAvailable.set(false);
          }
        } else {
          // New operation pushed. Disable redo.
          redoAvailable.set(false);
          if (currentVersion > lastVersion) {
            lastVersion = currentVersion;
          }
        }
        undoAvailable.set(true);
      }
      currentVersion = versionId;
    });

    monaco.editor.onDidChangeMarkers(() => {
      problems = monaco.editor.getModelMarkers({});
    });

    monacoEditor.onDidChangeCursorPosition((event) => {
      lineNumber = event.position.lineNumber;
      column = event.position.column;
    });

    envelope.subscribe((value) => {
      monacoEditor.updateOptions({ readOnly: Boolean(value?.sigs) });
    });

    document.addEventListener("undoButtonClick", handleUndoButtonClick, true);
    document.addEventListener("redoButtonClick", handleRedoButtonClick, true);
  });

  onDestroy(() => {
    monacoEditor.dispose();
    document.removeEventListener("undoButtonClick", handleUndoButtonClick, true);
    document.removeEventListener("redoButtonClick", handleRedoButtonClick, true);
  });

  function handleUndoButtonClick() {
    monacoEditor.updateOptions({ readOnly: false });
    monacoEditor.trigger("undoButton", "undo", null);
  }

  function handleRedoButtonClick() {
    monacoEditor.trigger("redoButton", "redo", null);
  }

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
    class="flex-none px-4 py-2 bg-zinc-700 text-white text-xs border-b-gray-600 flex items-center gap-6"
    on:dblclick={handleDrawerToggle}
  >
    <div>
      <span class="mr-1">
        {#if errorCount > 0}
          <ErrorIcon />
        {:else}
          <SuccessIcon />
        {/if}
      </span>
      <span class="align-middle">
        {errorCount}
        {errorCount === 1 ? "error" : "errors"}
      </span>
    </div>
    <div class="flex-1">
      <span class="mr-1">
        {#if warningCount > 0}
          <WarningIcon />
        {:else}
          <SuccessIcon />
        {/if}
      </span>
      <span class="align-middle">
        {warningCount}
        {warningCount === 1 ? "warning" : "warnings"}
      </span>
    </div>
    <div>Ln {lineNumber}, Col {column}</div>
    <button class="align-middle" on:click={handleDrawerToggle}>
      {#if drawerClosed}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clip-rule="evenodd"
          />
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      {/if}
    </button>
  </div>

  {#if !drawerClosed}
    <div
      class="flex-none h-36 py-2 overflow-auto font-mono text-xs text-white bg-zinc-800"
      transition:slide={{ duration: 300 }}
    >
      {#if $editor === ""}
        <p class="m-4">
          <span class="mr-2"><LightbulbIcon /></span><span class="align-middle"
            >To get started, choose a template from the menu bar.</span
          >
        </p>
      {/if}
      {#if $editor !== "" && problems.length === 0}
        <p class="m-4">
          <span class="mr-2"><LightbulbIcon /></span><span class="align-middle"
            >Use the action buttons in the menu bar.</span
          >
        </p>
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
