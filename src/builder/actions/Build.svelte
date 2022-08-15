<script lang="ts">
  import * as GOBL from "../../lib/gobl";
  import { createNotification, Severity } from "../notifications";
  import { envelope, editor, keypair, validEditor, goblError } from "../stores";
  import { iconButtonClasses } from "../ui/iconButtonClasses";
  import { runBuildCommand } from "./runBuildCommand";

  async function handleBuild() {
    if (!$validEditor || !$keypair) {
      return;
    }

    try {
      await runBuildCommand($envelope, $editor, $keypair, GOBL.build);
      goblError.set(null);
      createNotification({
        severity: Severity.Success,
        message: "Document successfully built.",
      });
    } catch (e) {
      goblError.set(GOBL.parseGOBLError(e));
    }
  }
</script>

<div
  id="tooltip-build"
  role="tooltip"
  class="inline-block absolute invisible z-10 py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
>
  {#if validEditor}
    Build the GOBL document.
  {:else}
    To build, first ensure the document is valid.
  {/if}
  <div class="tooltip-arrow" data-popper-arrow />
</div>
<button data-tooltip-target="tooltip-build" on:click={handleBuild} class={iconButtonClasses(!$validEditor)}>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path
      fill-rule="evenodd"
      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z"
      clip-rule="evenodd"
    />
  </svg>
</button>
