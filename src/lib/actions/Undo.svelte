<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import UndoIcon from "$lib/ui/icons/UndoIcon.svelte";
  import { getBuilderContext } from "$lib/store/builder";

  const dispatch = createEventDispatcher();

  const { undoAvailable } = getBuilderContext();

  function handleUndo() {
    dispatch("undo");
    document.dispatchEvent(new Event("undoButtonClick"));
  }
</script>

<button
  title="Undo the last change in the editor."
  on:click={handleUndo}
  class={iconButtonClasses}
  disabled={$undoAvailable === false}
>
  <UndoIcon />
</button>
