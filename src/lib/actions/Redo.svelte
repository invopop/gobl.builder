<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import RedoIcon from "$lib/ui/icons/RedoIcon.svelte";
  import { getBuilderContext } from "$lib/store/builder";

  const dispatch = createEventDispatcher();

  const { redoAvailable } = getBuilderContext();

  function handleRedo() {
    dispatch("redo");
    document.dispatchEvent(new Event("redoButtonClick"));
  }
</script>

<button
  title="Redo the last undone change in the editor."
  onclick={handleRedo}
  class={iconButtonClasses}
  disabled={$redoAvailable === false}
>
  <RedoIcon />
</button>
