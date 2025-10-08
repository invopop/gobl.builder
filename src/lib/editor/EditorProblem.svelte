<script lang="ts">
  import { clsx } from 'clsx'

  import { MarkerSeverity } from 'monaco-editor'
  import type { SvelteComponent } from 'svelte'
  import WarningIcon from '$lib/ui/icons/WarningIcon.svelte'
  import ErrorIcon from '$lib/ui/icons/ErrorIcon.svelte'
  import type { EditorProblemProps } from '$lib/types/editor'

  let { problem }: EditorProblemProps = $props()

  function problemIcon(): typeof SvelteComponent {
    switch (problem.severity) {
      case MarkerSeverity.Error:
        return ErrorIcon as typeof SvelteComponent
      case MarkerSeverity.Warning:
        return WarningIcon as typeof SvelteComponent
      default:
        throw new Error(`Unmapped problem severity "${problem.severity}".`)
    }
  }

  let classes = $derived(
    clsx({
      'text-red-400': problem.severity === MarkerSeverity.Error,
      'text-amber-400': problem.severity === MarkerSeverity.Warning
    })
  )

  const IconComponent = $derived(problemIcon())
</script>

<div class={classes}>
  <IconComponent />
  <div class="align-middle inline">
    {problem.message}
    <span class="opacity-60"
      >{problem.owner} [Ln {problem.startLineNumber}, Col {problem.startColumn}]</span
    >
  </div>
</div>
