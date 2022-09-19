<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { redoAvailable } from "$lib/stores.js";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";

  const dispatch = createEventDispatcher();

  function handleRedo() {
    dispatch("redo");
    document.dispatchEvent(new Event("redoButtonClick"));
  }
</script>

<Tooltip label="Redo the last undone change in the editor.">
  <button id="tooltip-redo-editor" on:click={handleRedo} class={iconButtonClasses($redoAvailable === false)}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"
      />
    </svg>
  </button>
</Tooltip>
