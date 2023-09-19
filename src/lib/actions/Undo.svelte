<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { undoAvailable } from "$lib/editor/stores.js";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import UndoIcon from "$lib/ui/icons/UndoIcon.svelte";

  const dispatch = createEventDispatcher();

  function handleUndo() {
    dispatch("undo");
    document.dispatchEvent(new Event("undoButtonClick"));
  }
</script>

<button
  title="Undo the last change in the editor."
  on:click={handleUndo}
  class={iconButtonClasses($undoAvailable === false)}
>
  <UndoIcon />
</button>
