<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { editor, envelope } from "$lib/stores.js";
  import { actionButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import { Icon, XCircle } from "svelte-hero-icons";

  const dispatch = createEventDispatcher();

  function handleClearEditor() {
    dispatch("clear");
    if ($editor === "") {
      return;
    }

    editor.set("");
    envelope.set(null);
  }

  $: disabled = $editor === "";
</script>

<Tooltip label="Clear the editor" containerClass="block">
  <button
    on:click={handleClearEditor}
    class={actionButtonClasses(disabled)}
    class:text-rose-700={!disabled}
    class:hover:bg-rose-200={!disabled}
  >
    <Icon src={XCircle} class="h-5 w-5" solid />
    Clear document
  </button>
</Tooltip>
