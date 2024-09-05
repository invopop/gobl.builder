<script lang="ts">
  import { tick } from "svelte";
  import loader from "@monaco-editor/loader";
  import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api.js";

  import type { Unsubscriber } from "svelte/store";

  import { onDestroy, onMount } from "svelte";
  import { slide } from "svelte/transition";
  import EditorProblem from "../EditorProblem.svelte";
  import WarningIcon from "$lib/ui/icons/WarningIcon.svelte";
  import ErrorIcon from "$lib/ui/icons/ErrorIcon.svelte";
  import SuccessIcon from "$lib/ui/icons/SuccessIcon.svelte";
  import LightbulbIcon from "$lib/ui/icons/LightbulbIcon.svelte";
  import { getBuilderContext } from "$lib/store/builder.js";
  import { getErrorString } from "$lib/helpers";

  let monaco: typeof Monaco;

  export let jsonSchemaURL: string;
  export let forceReadOnly = false;

  let editorEl: HTMLElement;
  let monacoEditor: Monaco.editor.IStandaloneCodeEditor;
  let model: Monaco.editor.ITextModel;
  let readOnlyEditHandler: Monaco.IDisposable;
  let lineNumber = 1;
  let column = 1;
  let drawerClosed = false;

  let unsubscribeEditor: Unsubscriber;

  const EditorUniqueId = Math.random().toString(36).slice(2, 7);
  const goblDocURL = `gobl://doc.json?${EditorUniqueId}`;

  const builderContext = getBuilderContext();

  const { editorProblems: problems, editor, envelope } = builderContext;

  // Sort by `monaco.MarkerSeverity` enum value descending, most severe shown first.
  $: sortedProblems = $problems.sort((a, b) => b.severity - a.severity);
  $: warningCount = monaco
    ? $problems.filter((problem) => problem.severity === monaco.MarkerSeverity.Warning).length
    : 0;
  $: errorCount = monaco ? $problems.filter((problem) => problem.severity === monaco.MarkerSeverity.Error).length : 0;

  $: {
    setSchemaURI(jsonSchemaURL);
  }

  $: forceReadOnly, setEditorReadOnly();

  $: showErrorConsole = !forceReadOnly && !$envelope?.sigs;

  function setSchemaURI(uri: string) {
    if (!monaco) {
      return;
    }
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      enableSchemaRequest: true,
      schemaValidation: "warning",
      schemas: uri
        ? [
            {
              fileMatch: [goblDocURL],
              uri,
            },
          ]
        : [],
    });
    if (monacoEditor) {
      const value = monacoEditor.getValue();
      validateSchema(value);
    }
  }

  onMount(async () => {
    builderContext.undoAvailable.set(false);
    builderContext.redoAvailable.set(false);
    const monacoEditorImport = await import("monaco-editor");
    loader.config({ monaco: monacoEditorImport.default });

    monaco = await loader.init();

    let modelUri = monaco.Uri.parse(goblDocURL);
    model = monaco.editor.createModel("", "json", modelUri);

    setSchemaURI(jsonSchemaURL);

    monacoEditor = monaco.editor.create(editorEl, {
      model,
      minimap: {
        enabled: false,
      },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      fontFamily: `CommitMono,
        ui-monospace,
        Menlo,
        Monaco,
        Consolas,
        "Ubuntu Mono",
        "Roboto Mono",
        "DejaVu Sans Mono",
        monospace`,
      scrollbar: {
        vertical: "hidden",
        useShadows: false,
      },
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false,
      renderLineHighlight: "line",
      renderLineHighlightOnlyWhenFocus: true,
      padding: {
        top: 12,
        bottom: 12,
      },
    });

    const messageContribution = monacoEditor.getContribution("editor.contrib.messageController");
    readOnlyEditHandler = monacoEditor.onDidAttemptReadOnlyEdit(() => {
      // eslint-disable-next-line -- MessageController class TS typing is not exported.
      (messageContribution as any).showMessage("Cannot edit already signed document", monacoEditor.getPosition());
    });

    const initialVersion = model.getAlternativeVersionId();
    let currentVersion = initialVersion;
    let lastVersion = initialVersion;

    builderContext.goblError.subscribe((goblErr) => {
      if (!goblErr) {
        monaco.editor.setModelMarkers(model, "gobl", []);
        return;
      }

      const parsedError = JSON.parse(goblErr.message);

      const errorString =
        parsedError.key === "validation" ? getErrorString(parsedError.fields?.doc) : parsedError.message;

      const errorsArr = errorString.split(" / ");

      monaco.editor.setModelMarkers(
        model,
        "gobl",
        errorsArr.map((message: string) => ({
          message,
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1,
        })),
      );
    });

    unsubscribeEditor = editor.subscribe(({ value }) => {
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
      const value = monacoEditor.getValue();
      editor.set({ value, updatedAt: Date.now() });

      const versionId = model.getAlternativeVersionId();
      if (versionId < currentVersion) {
        // Undo occured.
        builderContext.redoAvailable.set(true);
        if (versionId === initialVersion) {
          // No more undo items.
          builderContext.undoAvailable.set(false);
        }
      } else {
        if (versionId <= lastVersion) {
          // Redo occured.
          if (versionId == lastVersion) {
            // Redo of last change occured.
            builderContext.redoAvailable.set(false);
          }
        } else {
          // New operation pushed. Disable redo.
          builderContext.redoAvailable.set(false);
          if (currentVersion > lastVersion) {
            lastVersion = currentVersion;
          }
        }
        builderContext.undoAvailable.set(true);
      }
      currentVersion = versionId;

      validateSchema(value);
    });

    monaco.editor.onDidChangeMarkers(() => {
      problems.set(monaco.editor.getModelMarkers({}));
    });

    monacoEditor.onDidChangeCursorPosition((event) => {
      lineNumber = event.position.lineNumber;
      column = event.position.column;
    });

    document.fonts.ready.then(() => {
      monaco.editor.remeasureFonts();
    });

    document.addEventListener("undoButtonClick", handleUndoButtonClick, true);
    document.addEventListener("redoButtonClick", handleRedoButtonClick, true);

    setEditorReadOnly();
  });

  onDestroy(() => {
    $problems = []; // reset problems
    if (unsubscribeEditor != null) {
      unsubscribeEditor();
    }

    const models = monaco?.editor.getModels();

    monaco?.editor.getModels().forEach((m) => {
      // Only dispose the model that matches with the unique URI
      if (m.uri.query === EditorUniqueId) {
        m.dispose();
      }
    });

    // Only dispose the editor if there is only one active model
    if (models?.length === 1) {
      monacoEditor?.dispose();
      readOnlyEditHandler?.dispose();
    }

    document.removeEventListener("undoButtonClick", handleUndoButtonClick, true);
    document.removeEventListener("redoButtonClick", handleRedoButtonClick, true);
    console.log("destroying editor");
  });

  async function setEditorReadOnly() {
    if (!monacoEditor) return;

    if (!forceReadOnly) {
      monacoEditor.updateOptions({ readOnly: false });
      return;
    }

    // Svelte updates the DOM in batches and not immediately. We need to wait until svelte
    // has finished updating the DOM to set the readOnly status. Otherwise the editor content
    // update would be blocked
    await tick();
    monacoEditor.updateOptions({ readOnly: true });
  }

  // validateSchema is used to ensure the $schema property is set to something
  // that is expected by the component using the editor.
  function validateSchema(value: string) {
    if (!jsonSchemaURL) {
      return;
    }

    try {
      const parsed: Record<string, unknown> = JSON.parse(value);
      if (parsed.$schema !== jsonSchemaURL) {
        monaco.editor.setModelMarkers(model, "gobl-builder", [
          {
            message: `Property "$schema" must be \`${jsonSchemaURL}\`.`,
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1,
          },
        ]);
      } else {
        monaco.editor.setModelMarkers(model, "gobl-builder", []);
      }
    } catch (e) {
      monaco.editor.setModelMarkers(model, "gobl-builder", []);
    }
  }

  function handleUndoButtonClick() {
    monacoEditor.updateOptions({ readOnly: false });
    monacoEditor.trigger("undoButton", "undo", null);
  }

  function handleRedoButtonClick() {
    monacoEditor.trigger("redoButton", "redo", null);
  }

  function handleProblemClick(problem: Monaco.editor.IMarker) {
    return function () {
      monacoEditor.setPosition({ lineNumber: problem.startLineNumber, column: problem.startColumn });
      monacoEditor.revealLineInCenter(problem.startLineNumber);
    };
  }

  function handleDrawerToggle() {
    drawerClosed = !drawerClosed;
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex-1 overflow-hidden" bind:this={editorEl} />
  {#if showErrorConsole}
    <div class="w-full">
      <div
        class="flex-none px-4 py-2 bg-zinc-700 text-white text-xs border-b-gray-600 flex items-center gap-6"
        on:dblclick={handleDrawerToggle}
        role="log"
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
          {#if $editor.value === ""}
            <p class="m-4">
              <span class="mr-2"><LightbulbIcon /></span><span class="align-middle"
                >Warnings, errors and tips are shown in this area.</span
              >
            </p>
          {/if}
          {#if $editor.value !== "" && $problems.length === 0}
            <p class="m-4">
              <span class="mr-2"><LightbulbIcon /></span><span class="align-middle"
                >Use the action buttons in the menu bar.</span
              >
            </p>
          {/if}
          <ul>
            {#each sortedProblems as problem}
              <li class="block cursor-pointer px-4 py-1 hover:bg-zinc-700">
                <button on:click={handleProblemClick(problem)}>
                  <EditorProblem {problem} />
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  :global(.monaco-editor) {
    position: absolute !important;
  }
</style>
