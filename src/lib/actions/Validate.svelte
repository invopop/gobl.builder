<script lang="ts">
  import { Tooltip } from "flowbite-svelte";

  import * as GOBL from "$lib/gobl.js";
  import { encodeUTF8ToBase64 } from "$lib/encodeUTF8ToBase64.js";
  import { createNotification, Severity } from "$lib/notifications/index.js";
  import { envelope, envelopeIsDraft, editor, keypair, goblError } from "$lib/stores.js";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";

  export let jsonSchemaURL: string;

  $: validEditor = (function (): boolean {
    if (!$keypair) {
      return false;
    }

    try {
      const parsed = JSON.parse($editor);
      if (parsed.$schema !== jsonSchemaURL) {
        return false;
      }
    } catch (e) {
      return false;
    }

    return true;
  })();

  async function handleValidate() {
    if (!validEditor || $envelopeIsDraft) {
      return;
    }

    try {
      let envelopeValue = $envelope;
      let sendData: string;

      // If a (previously set) envelope exists, replace its `doc` property with
      // the editor contents. If not, send the editor contents as-is. In either case,
      // the GOBL command response will be an an enveloped document.
      if (envelopeValue) {
        envelopeValue.doc = JSON.parse($editor);
        sendData = JSON.stringify(envelopeValue);
      } else {
        sendData = $editor;
      }

      const payload: GOBL.ValidatePayload = {
        data: encodeUTF8ToBase64(sendData),
      };
      await GOBL.validate({ payload });

      goblError.set(null);
      createNotification({
        severity: Severity.Success,
        message: "Document successfully validated.",
      });
    } catch (e) {
      goblError.set(GOBL.parseGOBLError(e));
    }
  }
</script>

<Tooltip
  triggeredBy="#tooltip-validate"
  tipClass="py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm transition-opacity duration-300"
>
  Validate a signed GOBL document.
</Tooltip>
<button id="tooltip-validate" on:click={handleValidate} class={iconButtonClasses(!validEditor || $envelopeIsDraft)}>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path
      fill-rule="evenodd"
      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clip-rule="evenodd"
    />
  </svg>
</button>
