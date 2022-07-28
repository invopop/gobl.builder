<script lang="ts">
  import { undoAvailable } from "../stores";
  import { iconButtonClasses } from "../ui/iconButtonClasses";

  function handleUndo() {
    document.dispatchEvent(new Event("undoButtonClick"));
  }
</script>

<div
  id="tooltip-undo-editor"
  role="tooltip"
  class="inline-block absolute invisible z-10 py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
>
  Undo the last change in the editor.
  <div class="tooltip-arrow" data-popper-arrow />
</div>
<button
  data-tooltip-target="tooltip-undo-editor"
  on:click={handleUndo}
  class={iconButtonClasses($undoAvailable === false)}
>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path
      d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"
    />
  </svg>
</button>
