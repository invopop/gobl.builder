<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { undoAvailable } from "$lib/editor/stores.js";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";

  const dispatch = createEventDispatcher();

  function handleUndo() {
    dispatch("undo");
    document.dispatchEvent(new Event("undoButtonClick"));
  }
</script>

<Tooltip label="Undo the last change in the editor.">
  <button on:click={handleUndo} class={iconButtonClasses($undoAvailable === false)}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"
      />
    </svg>
  </button>
</Tooltip>
