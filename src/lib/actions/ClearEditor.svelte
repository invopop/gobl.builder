<script lang="ts">
  import { Tooltip } from "flowbite-svelte";

  import { editor, envelope } from "$lib/stores.js";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";

  function handleClearEditor() {
    if ($editor === "") {
      return;
    }

    editor.set("");
    envelope.set(null);
  }
</script>

<Tooltip
  triggeredBy="#tooltip-clear-editor"
  tipClass="py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm transition-opacity duration-300"
>
  Clear the editor.
</Tooltip>
<button id="tooltip-clear-editor" on:click={handleClearEditor} class={iconButtonClasses($editor === "")}>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path
      fill-rule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      clip-rule="evenodd"
    />
  </svg>
</button>
