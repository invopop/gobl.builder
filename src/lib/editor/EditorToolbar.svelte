<script lang="ts">
  import * as monaco from "monaco-editor";
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";

  import { editor, editorProblems as problems, editorCursor } from "$lib/stores.js";
  import EditorProblem from "./EditorProblem.svelte";
  import WarningIcon from "$lib/ui/WarningIcon.svelte";
  import ErrorIcon from "$lib/ui/ErrorIcon.svelte";
  import SuccessIcon from "$lib/ui/SuccessIcon.svelte";
  import LightbulbIcon from "$lib/ui/LightbulbIcon.svelte";
  import ExpandButton from "$lib/ui/ExpandButton.svelte";

  const dispatch = createEventDispatcher();

  export let open = true;

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
</script>

<div>
  <div
    class="px-4 py-2 bg-zinc-700 text-white text-xs border-b-gray-600 flex items-center gap-6"
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
    <div>Ln {$editorCursor.line}, Col {$editorCursor.column}</div>
    <ExpandButton open={!open} on:click={handleDrawerToggle} />
  </div>

  {#if open}
    <div class="h-36 py-2 overflow-auto font-mono text-xs text-white bg-zinc-800" transition:slide={{ duration: 300 }}>
      {#if $editor === ""}
        <p class="m-4">
          <span class="mr-2"><LightbulbIcon /></span><span class="align-middle"
            >Warnings, errors and tips are shown in this area.</span
          >
        </p>
      {/if}
      {#if $editor !== "" && $problems.length === 0}
        <p class="m-4">
          <span class="mr-2"><LightbulbIcon /></span><span class="align-middle"
            >Use the action buttons in the menu bar.</span
          >
        </p>
      {/if}
      <ul>
        {#each sortedProblems as problem}
          <li class="block cursor-pointer px-4 py-1 hover:bg-zinc-700" on:click={handleProblemClick(problem)}>
            <EditorProblem {problem} />
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
