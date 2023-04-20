<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import * as GOBL from "$lib/gobl.js";
  import { encodeUTF8ToBase64 } from "$lib/encodeUTF8ToBase64.js";
  import { createNotification, Severity } from "$lib/notifications/index.js";
  import { envelope, editor, keypair, goblError, type GOBLError } from "$lib/stores.js";
  import { actionButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import { Icon, PencilSquare } from "svelte-hero-icons";

  const dispatch = createEventDispatcher<{
    sign: { result?: unknown; error?: GOBLError };
  }>();

  export let jsonSchemaURL: string;

  $: validEditor = (function (): boolean {
    if (!$keypair) {
      return false;
    }

    try {
      const parsed = JSON.parse($editor.value);
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
        envelopeValue.doc = JSON.parse($editor.value);
        sendData = JSON.stringify(envelopeValue);
      } else {
        sendData = $editor.value;
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
        const value = JSON.stringify(result.doc, null, 4);
        editor.set({ value, updatedAt: Date.now() });
        envelope.set(result);
      } else {
        const value = JSON.stringify(result, null, 4);
        editor.set({ value, updatedAt: Date.now() });
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

<Tooltip label="Sign document" containerClass="block">
  <button on:click={handleSign} class={actionButtonClasses(!validEditor)}>
    <Icon src={PencilSquare} class="h-5 w-5" solid />
    Sign document
  </button>
</Tooltip>
