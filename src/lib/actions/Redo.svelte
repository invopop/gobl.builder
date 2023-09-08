<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { redoAvailable } from "$lib/editor/stores.js";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import RedoIcon from "$lib/ui/icons/RedoIcon.svelte";

  const dispatch = createEventDispatcher();

  function handleRedo() {
    dispatch("redo");
    document.dispatchEvent(new Event("redoButtonClick"));
  }
</script>

<Tooltip label="Redo the last undone change in the editor.">
  <button on:click={handleRedo} class={iconButtonClasses($redoAvailable === false)}>
    <RedoIcon />
  </button>
</Tooltip>
