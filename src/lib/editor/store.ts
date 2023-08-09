import { writable } from "svelte/store";
import type * as monaco from "monaco-editor";

export const editorProblems = writable<monaco.editor.IMarker[]>([]);
