<script lang="ts">
  import utf8 from "utf8";
  import base64 from "base-64";

  import * as GOBL from "../lib/gobl";
  import { keypair, editor, envelope, goblError, GOBLError } from "./stores";
  import Button from "../ui/Button.svelte";
  import { createNotification, Severity } from "./notifications";

  let buildable = false;

  editor.subscribe((value) => {
    try {
      JSON.parse(value);
      buildable = true;
    } catch (e) {
      buildable = false;
    }
  });

  $: buildEnabled = Boolean($keypair) && buildable;

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
    let envelopeValue = $envelope;

    try {
      if (!envelopeValue) {
        // If no envelope exists yet, create one with the current editor
        // contents.
        const result = await GOBL.envelop({
          payload: {
            data: encodeUTF8ToBase64($editor),
            privatekey: $keypair.private,
            draft: true,
          },
          indent: true,
        });
        envelopeValue = JSON.parse(result);
      } else {
        // If envelope already exists, replace the `doc` property with the
        // current editor contents.
        envelopeValue.doc = JSON.parse($editor);

        const payload = {
          data: encodeUTF8ToBase64(JSON.stringify(envelopeValue)),
          privatekey: $keypair.private,
          draft: true,
        };

        // Do a "build" operation with the updated envelope.
        const result = await GOBL.build({ payload, indent: true });
        envelopeValue = JSON.parse(result);
      }

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

<div class="flex gap-2">
  <Button on:click={handleBuildClick} disabled={!buildEnabled}>Build</Button>
</div>
