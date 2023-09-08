<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { editor, envelope, goblError, newEnvelope } from "$lib/editor/stores.js";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import ClearIcon from "$lib/ui/icons/ClearIcon.svelte";

  const dispatch = createEventDispatcher();

  function handleClearEditor() {
    dispatch("clear");
    if ($editor.value === "") {
      return;
    }

    goblError.set(null);
    envelope.set(newEnvelope(null));
  }
</script>

<Tooltip label="Clear the editor.">
  <button on:click={handleClearEditor} class={iconButtonClasses($editor.value === "")}>
    <ClearIcon />
  </button>
</Tooltip>
