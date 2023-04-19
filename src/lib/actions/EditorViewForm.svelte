<script lang="ts">
  import { editorViewType } from "$lib/stores.js";
  import { editorViewButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import { getChangeViewHandler } from "$lib/editor/form/utils/tab.js";

  const handleViewForm = getChangeViewHandler("form");
  $: disabled = $editorViewType === "form";
  $: label = !disabled ? "Swap to visual editor view" : undefined;
</script>

<Tooltip containerClass="block" {label}>
  <button on:click={handleViewForm} class={editorViewButtonClasses(disabled)}>Visual</button>
</Tooltip>
