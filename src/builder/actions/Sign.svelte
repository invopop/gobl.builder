<script lang="ts">
  import * as GOBL from "../../lib/gobl";
  import { createNotification, Severity } from "../notifications";
  import { envelope, editor, keypair, validEditor, goblError } from "../stores";
  import { iconButtonClasses } from "../ui/iconButtonClasses";
  import { runBuildCommand } from "./runBuildCommand";

  async function handleSign() {
    try {
      await runBuildCommand($envelope, $editor, $keypair, GOBL.sign);
      goblError.set(null);
      createNotification({
        severity: Severity.Success,
        message: "Document successfully signed.",
      });
    } catch (e) {
      goblError.set(GOBL.parseGOBLError(e));
    }
  }
</script>

<div
  id="tooltip-sign"
  role="tooltip"
  class="inline-block absolute invisible z-10 py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
>
  Sign document.
  <div class="tooltip-arrow" data-popper-arrow />
</div>
<button data-tooltip-target="tooltip-sign" on:click={handleSign} class={iconButtonClasses(!$validEditor)}>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path
      fill-rule="evenodd"
      d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
      clip-rule="evenodd"
    />
  </svg>
</button>
