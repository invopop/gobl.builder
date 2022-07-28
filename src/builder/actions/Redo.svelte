<script lang="ts">
  import { redoAvailable } from "../stores";
  import { iconButtonClasses } from "../ui/iconButtonClasses";

  function handleRedo() {
    document.dispatchEvent(new Event("redoButtonClick"));
  }
</script>

<div
  id="tooltip-redo-editor"
  role="tooltip"
  class="inline-block absolute invisible z-10 py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
>
  Redo the last undone change in the editor.
  <div class="tooltip-arrow" data-popper-arrow />
</div>
<button
  data-tooltip-target="tooltip-redo-editor"
  on:click={handleRedo}
  class={iconButtonClasses($redoAvailable === false)}
>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path
      d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"
    />
  </svg>
</button>
