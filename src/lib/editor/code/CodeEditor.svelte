<script lang="ts">
  import * as monaco from "monaco-editor";
  import type { Environment } from "monaco-editor";
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";

  import JSONWorker from "$lib/monaco-editor/json.worker.js?worker";
  import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
  import {
    editor,
    editorProblems as problems,
    goblError,
    redoAvailable,
    undoAvailable,
    envelope,
    editorCursor,
  } from "$lib/stores.js";

  const modelUri = monaco.Uri.parse("gobl://doc.json");

  export let jsonSchemaURL: string;

  let editorEl: HTMLElement;
  let monacoEditor: monaco.editor.IStandaloneCodeEditor;
  let model: monaco.editor.ITextModel;
  let readOnlyEditHandler: monaco.IDisposable;
  let unsubscribeEditor: Unsubscriber;

  $: {
    setSchemaURI(jsonSchemaURL);
  }

  function setSchemaURI(uri: string) {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      enableSchemaRequest: true,
      schemaValidation: "warning",
      schemas: uri
        ? [
            {
              fileMatch: [modelUri.toString()],
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

  onMount(() => {
    (<Environment>(self as Window).MonacoEnvironment) = {
      getWorker: function (_: string, label: string) {
        switch (label) {
          case "json":
            return new JSONWorker();
          default:
            return new EditorWorker();
        }
      },
    };

    model = monaco.editor.createModel("", "json", modelUri);

    setSchemaURI(jsonSchemaURL);

    monacoEditor = monaco.editor.create(editorEl, {
      model,
      minimap: {
        enabled: false,
      },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      fontFamily: `ui-monospace, "Fira Code", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
      scrollbar: {
        useShadows: false,
      },
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

    unsubscribeEditor = editor.subscribe((value) => {
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
      editor.set(value);

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

      validateSchema(value);
    });

    monaco.editor.onDidChangeMarkers(() => {
      problems.set(monaco.editor.getModelMarkers({}));
    });

    monacoEditor.onDidChangeCursorPosition((event) => {
      const { lineNumber: line, column } = event.position;
      $editorCursor = { line, column };
    });

    document.fonts.ready.then(() => {
      monaco.editor.remeasureFonts();
    });

    envelope.subscribe((value) => {
      monacoEditor.updateOptions({ readOnly: Boolean(value?.sigs) });
    });

    document.addEventListener("undoButtonClick", handleUndoButtonClick, true);
    document.addEventListener("redoButtonClick", handleRedoButtonClick, true);
    document.addEventListener("problemClick", handleProblemClick as any, true);
  });

  onDestroy(() => {
    unsubscribeEditor();
    model.dispose();
    monacoEditor.dispose();
    readOnlyEditHandler.dispose();
    document.removeEventListener("undoButtonClick", handleUndoButtonClick, true);
    document.removeEventListener("redoButtonClick", handleRedoButtonClick, true);
    document.removeEventListener("problemClick", handleProblemClick as any, true);
  });

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

  function handleProblemClick({ detail: problem }: CustomEvent<monaco.editor.IMarker>) {
    monacoEditor.setPosition({ lineNumber: problem.startLineNumber, column: problem.startColumn });
    monacoEditor.revealLineInCenter(problem.startLineNumber);
  }
</script>

<div class="flex-1 h-full overflow-hidden" bind:this={editorEl} />
