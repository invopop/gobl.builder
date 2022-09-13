<script lang="ts">
  import { Tooltip } from "flowbite-svelte";

  import * as GOBL from "$lib/gobl.js";
  import { encodeUTF8ToBase64 } from "$lib/encodeUTF8ToBase64.js";
  import { createNotification, Severity } from "$lib/notifications/index.js";
  import { envelope, editor, keypair, goblError } from "$lib/stores.js";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";

  export let jsonSchemaURL: string;

  $: validEditor = (function (): boolean {
    if (!$keypair) {
      return false;
    }

    try {
      const parsed = JSON.parse($editor);
      if (jsonSchemaURL && parsed.$schema !== jsonSchemaURL) {
        return false;
      }
    } catch (e) {
      return false;
    }

    return true;
  })();

  async function handleBuild() {
    if (!validEditor || !$keypair) {
      return;
    }

    try {
      let sendData: string;
      let envelopeValue = $envelope;

      // If a (previously set) envelope exists, replace its `doc` property with
      // the editor contents. If not, send the editor contents as-is. In either case,
      // the GOBL command response will be an an enveloped document.
      if (envelopeValue) {
        envelopeValue.doc = JSON.parse($editor);
        sendData = JSON.stringify(envelopeValue);
      } else {
        sendData = $editor;
      }

      const payload: GOBL.BuildPayload = {
        data: encodeUTF8ToBase64(sendData),
        privatekey: $keypair.private,
        draft: true,
        envelop: true,
      };
      const rawResult = await GOBL.build({ payload, indent: true });
      const result = JSON.parse(rawResult);

      if (result.$schema === "https://gobl.org/draft-0/envelope") {
        // Set new editor value *first*, because when the envelope is set, the Monaco
        // editor if the envelope contains signatures.
        editor.set(JSON.stringify(result.doc, null, 4));
        envelope.set(result);
      } else {
        editor.set(JSON.stringify(result, null, 4));
      }

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

<Tooltip
  triggeredBy="#tooltip-build"
  tipClass="py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm transition-opacity duration-300"
>
  {#if validEditor}
    Build the GOBL document.
  {:else}
    To build, first ensure the document is valid.
  {/if}
</Tooltip>
<button id="tooltip-build" on:click={handleBuild} class={iconButtonClasses(!validEditor)}>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path
      fill-rule="evenodd"
      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z"
      clip-rule="evenodd"
    />
  </svg>
</button>
