<script lang="ts">
  import * as monaco from "monaco-editor";
  import { editorViewType } from "$lib/stores.js";
  import { editorViewButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import { getChangeViewHandler } from "$lib/editor/form/utils/tab.js";
  import { editorProblems } from "$lib/stores.js";
  import { Icon, InformationCircle } from "svelte-hero-icons";

  const handleViewCode = getChangeViewHandler("code");
  $: disabled = $editorViewType === "code";
  $: label = !disabled ? "Swap to code editor view" : undefined;

  $: error = $editorProblems.filter((problem) => problem.severity === monaco.MarkerSeverity.Error)[0]?.message;
</script>

<Tooltip containerClass="block" {label}>
  <button on:click={handleViewCode} class={editorViewButtonClasses(disabled, true) + " relative"}>
    Code
    {#if error}<Icon
        src={InformationCircle}
        class="absolute top-0 right-0 h-4 w-4 text-rose-500 translate-x-1/3 -translate-y-1/3"
        solid
      />{/if}
  </button>
</Tooltip>
