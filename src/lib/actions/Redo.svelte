<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { redoAvailable } from "$lib/editor/stores.js";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import RedoIcon from "$lib/ui/icons/RedoIcon.svelte";

  const dispatch = createEventDispatcher();

  function handleRedo() {
    dispatch("redo");
    document.dispatchEvent(new Event("redoButtonClick"));
  }
</script>

<button
  title="Redo the last undone change in the editor."
  on:click={handleRedo}
  class={iconButtonClasses($redoAvailable === false)}
>
  <RedoIcon />
</button>
