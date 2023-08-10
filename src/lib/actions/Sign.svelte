<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import * as GOBL from "@invopop/gobl-worker";
  import { encodeUTF8ToBase64 } from "$lib/encodeUTF8ToBase64.js";
  import { Severity, createNotification } from "$lib/notifications/index.js";
  import type { GOBLError } from "@invopop/gobl-worker";
  import { envelope, editor, keypair, goblError } from "$lib/editor/stores.js";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";

  const dispatch = createEventDispatcher<{
    sign: { result?: unknown; error?: GOBLError };
  }>();

  export let jsonSchemaURL: string;

  $: validEditor = (function (): boolean {
    if (!$keypair) {
      return false;
    }

    try {
      const parsed = JSON.parse($editor || "");
      if (jsonSchemaURL && parsed.$schema !== jsonSchemaURL) {
        return false;
      }
    } catch (e) {
      return false;
    }

    return true;
  })();

  async function handleSign() {
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
        envelopeValue.doc = JSON.parse($editor || "");
        sendData = JSON.stringify(envelopeValue);
      } else {
        sendData = $editor || "";
      }

      const payload: GOBL.SignPayload = {
        data: encodeUTF8ToBase64(sendData),
        privatekey: $keypair.private,
      };
      const rawResult = await GOBL.sign({ payload, indent: true });
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
      dispatch("sign", {
        result,
      });
      createNotification({
        severity: Severity.Success,
        message: "Document successfully signed.",
      });
    } catch (e) {
      const goblErr = GOBL.parseGOBLError(e);
      goblError.set(goblErr);
      dispatch("sign", {
        error: goblErr,
      });
    }
  }
</script>

<Tooltip label="Sign document.">
  <button on:click={handleSign} class={iconButtonClasses(!validEditor)}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
      <path
        fill-rule="evenodd"
        d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
</Tooltip>
