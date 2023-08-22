<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import * as GOBL from "@invopop/gobl-worker";
  import { encodeUTF8ToBase64 } from "$lib/encodeUTF8ToBase64.js";
  import { Severity, createNotification } from "$lib/notifications/index.js";
  import type { GOBLError } from "@invopop/gobl-worker";
  import { envelope, editor, goblError, envelopeGOBLSchema, validEditor } from "$lib/editor/stores.js";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";

  const dispatch = createEventDispatcher<{
    build: { result?: unknown; error?: GOBLError };
  }>();

  $: tooltip = $validEditor ? "Build the GOBL document." : "To build, first ensure the document is valid.";

  async function handleBuild() {
    if (!$validEditor) {
      return;
    }

    try {
      let sendData: string;
      let envelopeValue = $envelope;

      let doc = JSON.parse($editor || "");
      if (doc.$schema == envelopeGOBLSchema) {
        sendData = $editor || ""; // send as-is
      } else {
        envelopeValue.doc = doc;
        sendData = JSON.stringify(envelopeValue);
      }

      const payload: GOBL.BuildPayload = {
        data: encodeUTF8ToBase64(sendData),
        draft: true,
        envelop: true,
      };
      const rawResult = await GOBL.build({ payload });
      const result = JSON.parse(rawResult);

      envelope.set(result);
      goblError.set(null);

      dispatch("build", {
        result,
      });
      createNotification({
        severity: Severity.Success,
        message: "Document successfully built.",
      });
    } catch (e) {
      const goblErr = GOBL.parseGOBLError(e);
      goblError.set(goblErr);
      dispatch("build", {
        error: goblErr,
      });
    }
  }

  // Exposed function to perform the action from outside
  export const doAction = () => handleBuild();
</script>

<Tooltip label={tooltip}>
  <button on:click={handleBuild} class={iconButtonClasses(!$validEditor)}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
</Tooltip>
