<script lang="ts">
  import utf8 from "utf8";
  import base64 from "base-64";

  import * as GOBL from "../../lib/gobl";
  import { keypair, editor, envelope, goblError, GOBLError } from "../stores";
  import { createNotification, Severity } from "../notifications";
  import { iconButtonClasses } from "../ui/iconButtonClasses";
  import type { BuildRequest } from "../../lib/gobl";

  let buildable = false;

  $: buildEnabled = Boolean($keypair) && buildable;

  editor.subscribe((value) => {
    try {
      JSON.parse(value);
      buildable = true;
    } catch (e) {
      buildable = false;
    }
  });

  function encodeUTF8ToBase64(value: string): string {
    return base64.encode(utf8.encode(value));
  }

  const goblErrorRegexp = /^code=(\d+), message=(.+)$/;

  function parseGOBLError(err: string): GOBLError {
    const result = err.match(goblErrorRegexp);
    return {
      message: result[2] || err,
      code: +result[1] || 0,
    };
  }

  async function handleBuildClick() {
    if (!buildEnabled) {
      return;
    }

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

    try {
      const payload: BuildRequest["payload"] = {
        data: encodeUTF8ToBase64(sendData),
        privatekey: $keypair.private,
      };
      const result = await GOBL.build({ payload, indent: true });
      envelopeValue = JSON.parse(result);

      envelope.set(envelopeValue);
      editor.set(JSON.stringify(envelopeValue.doc, null, 4));

      goblError.set(null);
      createNotification({
        severity: Severity.Success,
        message: "Document successfully built.",
      });
    } catch (e) {
      goblError.set(parseGOBLError(e));
    }
  }
</script>

<div
  id="tooltip-build"
  role="tooltip"
  class="inline-block absolute invisible z-10 py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
>
  {#if buildEnabled}
    Build the GOBL document.
  {:else}
    To build, first ensure the document is valid.
  {/if}
  <div class="tooltip-arrow" data-popper-arrow />
</div>
<button class={iconButtonClasses(!buildEnabled)} on:click={handleBuildClick} data-tooltip-target="tooltip-build">
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path
      fill-rule="evenodd"
      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
      clip-rule="evenodd"
    />
  </svg>
</button>
