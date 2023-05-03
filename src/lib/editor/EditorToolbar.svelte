<script lang="ts">
  import * as monaco from "monaco-editor";
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";

  import { editor, editorProblems as problems, editorCursor } from "$lib/stores.js";
  import EditorProblem from "./EditorProblem.svelte";
  import LightbulbIcon from "$lib/ui/LightbulbIcon.svelte";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";

  const dispatch = createEventDispatcher();

  export let open = false;

  // Sort by `monaco.MarkerSeverity` enum value descending, most severe shown first.
  $: sortedProblems = $problems.sort((a, b) => b.severity - a.severity);
  $: warningCount = $problems.filter((problem) => problem.severity === monaco.MarkerSeverity.Warning).length;
  $: errorCount = $problems.filter((problem) => problem.severity === monaco.MarkerSeverity.Error).length;

  function handleProblemClick(problem: monaco.editor.IMarker) {
    return () => {
      dispatch("problemClick", problem);
      document.dispatchEvent(new CustomEvent("problemClick", { detail: problem }));
    };
  }

  function handleDrawerToggle() {
    open = !open;
  }

  $: open = errorCount > 0;
</script>

<div>
  <div
    class="px-4 py-2 bg-color5 text-color4 text-xs flex items-center gap-6 cursor-pointer"
    on:click={handleDrawerToggle}
  >
    <div>
      <span class="align-middle">
        {errorCount}
        {errorCount === 1 ? "error" : "errors"}
      </span>
    </div>
    <div class="flex-1">
      <span class="align-middle">
        {warningCount}
        {warningCount === 1 ? "warning" : "warnings"}
      </span>
    </div>
    <div>Ln {$editorCursor.line}, Col {$editorCursor.column}</div>
    <ExpandButton {open} />
  </div>

  {#if open}
    <div class="h-36 py-2 overflow-auto font-mono text-xs text-color4 bg-grey-4 " transition:slide={{ duration: 300 }}>
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
          <li class="block cursor-pointer px-4 py-1 hover:bg-color4" on:click={handleProblemClick(problem)}>
            <EditorProblem {problem} />
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
