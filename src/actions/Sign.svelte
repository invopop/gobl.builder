<script lang="ts">
  import * as GOBL from "../lib/gobl";
  import { encodeUTF8ToBase64 } from "../lib/encodeUTF8ToBase64";
  import { createNotification, Severity } from "../notifications";
  import { envelope, editor, keypair, validEditor, goblError } from "../stores";
  import { iconButtonClasses } from "../ui/iconButtonClasses";

  async function handleSign() {
    if (!$validEditor || !$keypair) {
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
