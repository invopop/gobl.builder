<script lang="ts">
  import { editorViewType } from "$lib/stores.js";
  import { editorViewButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import { getChangeViewHandler } from "$lib/editor/form/utils/tab.js";

  const handleViewForm = getChangeViewHandler("form");
</script>

<Tooltip label="Swap to visual editor view.">
  <button on:click={handleViewForm} class={editorViewButtonClasses($editorViewType === "form")}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
      />
    </svg> Visual
  </button>
</Tooltip>
