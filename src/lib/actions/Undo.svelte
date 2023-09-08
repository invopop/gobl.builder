<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { undoAvailable } from "$lib/editor/stores.js";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import UndoIcon from "$lib/ui/icons/UndoIcon.svelte";

  const dispatch = createEventDispatcher();

  function handleUndo() {
    dispatch("undo");
    document.dispatchEvent(new Event("undoButtonClick"));
  }
</script>

<Tooltip label="Undo the last change in the editor.">
  <button on:click={handleUndo} class={iconButtonClasses($undoAvailable === false)}>
    <UndoIcon />
  </button>
</Tooltip>
