<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import * as GOBL from "@invopop/gobl-worker";
  import { encodeUTF8ToBase64 } from "$lib/encodeUTF8ToBase64.js";
  import { Severity, createNotification } from "$lib/notifications/index.js";
  import type { GOBLError } from "@invopop/gobl-worker";
  import {
    envelope,
    envelopeIsSigned,
    editor,
    goblError,
    envelopeGOBLSchema,
    validEditor,
  } from "$lib/editor/stores.js";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";

  const dispatch = createEventDispatcher<{
    validate: { isValid: boolean; error?: GOBLError };
  }>();

  async function handleValidate() {
    if (!$validEditor || !$envelopeIsSigned) {
      return;
    }

    try {
      let envelopeValue = $envelope;
      let sendData: string;

      let doc = JSON.parse($editor || "");
      if (doc.$schema == envelopeGOBLSchema) {
        sendData = $editor || ""; // send as-is
      } else {
        envelopeValue.doc = doc;
        sendData = JSON.stringify(envelopeValue);
      }

      const payload: GOBL.ValidatePayload = {
        data: encodeUTF8ToBase64(sendData),
      };
      await GOBL.validate({ payload });

      goblError.set(null);
      dispatch("validate", {
        isValid: true,
      });
      createNotification({
        severity: Severity.Success,
        message: "Document successfully validated.",
      });
    } catch (e) {
      const goblErr = GOBL.parseGOBLError(e);
      goblError.set(goblErr);
      dispatch("validate", {
        isValid: false,
        error: goblErr,
      });
    }
  }

  // Exposed function to perform the action from outside
  export const doAction = () => handleValidate();
</script>

<Tooltip label="Validate a signed GOBL document.">
  <button on:click={handleValidate} class={iconButtonClasses(!$validEditor || !$envelopeIsSigned)}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
</Tooltip>
