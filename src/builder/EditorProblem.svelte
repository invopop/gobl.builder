<script lang="ts">
  import classNames from "classnames";

  import * as monaco from "monaco-editor";

  export let problem: monaco.editor.IMarker;

  function problemIcon(): string {
    switch (problem.severity) {
      case monaco.MarkerSeverity.Error:
        return "⨯";
      case monaco.MarkerSeverity.Warning:
        return "⚠️";
    }
  }

  const classes = classNames({
    "text-red-400": problem.severity === monaco.MarkerSeverity.Error,
    "text-amber-600": problem.severity === monaco.MarkerSeverity.Warning,
  });
</script>

<div class={classes}>
  {problemIcon()}
  {problem.message}
  <span class="opacity-60">{problem.owner} [Ln {problem.startLineNumber}, Col {problem.startColumn}]</span>
</div>
