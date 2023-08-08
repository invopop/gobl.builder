<script lang="ts">
  import { clsx } from "clsx";

  import { MarkerSeverity, editor } from "monaco-editor";
  import type { SvelteComponent } from "svelte";
  import WarningIcon from "$lib/ui/icons/WarningIcon.svelte";
  import ErrorIcon from "$lib/ui/icons/ErrorIcon.svelte";

  export let problem: editor.IMarker;

  function problemIcon(): typeof SvelteComponent {
    switch (problem.severity) {
      case MarkerSeverity.Error:
        return ErrorIcon as typeof SvelteComponent;
      case MarkerSeverity.Warning:
        return WarningIcon as typeof SvelteComponent;
      default:
        throw new Error(`Unmapped problem severity "${problem.severity}".`);
    }
  }

  $: classes = clsx({
    "text-red-400": problem.severity === MarkerSeverity.Error,
    "text-amber-400": problem.severity === MarkerSeverity.Warning,
  });
</script>

<div class={classes}>
  <svelte:component this={problemIcon()} />
  <div class="align-middle inline">
    {problem.message}
    <span class="opacity-60">{problem.owner} [Ln {problem.startLineNumber}, Col {problem.startColumn}]</span>
  </div>
</div>
