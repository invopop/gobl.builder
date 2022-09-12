<script lang="ts">
  import { clsx } from "clsx";

  import * as monaco from "monaco-editor";
  import type { SvelteComponent } from "svelte";
  import WarningIcon from "$lib/ui/WarningIcon.svelte";
  import ErrorIcon from "$lib/ui/ErrorIcon.svelte";

  export let problem: monaco.editor.IMarker;

  function problemIcon(): typeof SvelteComponent {
    switch (problem.severity) {
      case monaco.MarkerSeverity.Error:
        return ErrorIcon;
      case monaco.MarkerSeverity.Warning:
        return WarningIcon;
      default:
        throw new Error(`Unmapped problem severity "${problem.severity}".`);
    }
  }

  $: classes = clsx({
    "text-red-400": problem.severity === monaco.MarkerSeverity.Error,
    "text-amber-400": problem.severity === monaco.MarkerSeverity.Warning,
  });
</script>

<div class={classes}>
  <svelte:component this={problemIcon()} />
  <div class="align-middle inline">
    {problem.message}
    <span class="opacity-60">{problem.owner} [Ln {problem.startLineNumber}, Col {problem.startColumn}]</span>
  </div>
</div>
