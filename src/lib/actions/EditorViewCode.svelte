<script lang="ts">
  import { editorViewType } from "$lib/stores.js";
  import { editorViewButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import { getChangeViewHandler } from "$lib/editor/form/utils/tab.js";

  const handleViewCode = getChangeViewHandler("code");
  $: disabled = $editorViewType === "code";
  $: label = !disabled ? "Swap to code editor view" : undefined;
</script>

<Tooltip containerClass="block" {label}>
  <button on:click={handleViewCode} class={editorViewButtonClasses(disabled)}>Code</button>
</Tooltip>
