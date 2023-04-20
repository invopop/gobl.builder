<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import * as GOBL from "$lib/gobl.js";
  import { encodeUTF8ToBase64 } from "$lib/encodeUTF8ToBase64.js";
  import { createNotification, Severity } from "$lib/notifications/index.js";
  import { envelope, editor, goblError, type GOBLError } from "$lib/stores.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import { clsx } from "clsx";

  const dispatch = createEventDispatcher<{
    build: { result?: unknown; error?: GOBLError };
  }>();

  export let jsonSchemaURL: string;

  $: validEditor = (function (): boolean {
    try {
      const parsed = JSON.parse($editor.value || "");
      if (jsonSchemaURL && parsed.$schema !== jsonSchemaURL) {
        return false;
      }
    } catch (e) {
      return false;
    }

    return true;
  })();

  async function handleBuild() {
    if (!validEditor) {
      return;
    }

    try {
      let sendData: string;
      let envelopeValue = $envelope;

      // If a (previously set) envelope exists, replace its `doc` property with
      // the editor contents. If not, send the editor contents as-is. In either case,
      // the GOBL command response will be an an enveloped document.
      if (envelopeValue) {
        envelopeValue.doc = JSON.parse($editor.value || "");
        sendData = JSON.stringify(envelopeValue);
      } else {
        sendData = $editor.value || "";
      }

      const payload: GOBL.BuildPayload = {
        data: encodeUTF8ToBase64(sendData),
        draft: true,
        envelop: true,
      };
      const rawResult = await GOBL.build({ payload, indent: true });
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

  $: tooltip = validEditor ? "Build the GOBL document." : "To build, first ensure the document is valid.";

  function buttonClasses(disabled: boolean): string {
    return clsx("rounded bg-slate-100 border border-slate-200 py-2 px-4", {
      "text-gray-700 hover:bg-slate-200": !disabled,
      "text-gray-400 cursor-not-allowed": disabled,
    });
  }
</script>

<Tooltip label={tooltip}>
  <button on:click={handleBuild} class={buttonClasses(!validEditor)}>Build</button>
</Tooltip>
