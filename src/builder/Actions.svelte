<script lang="ts">
  import utf8 from "utf8";
  import base64 from "base-64";

  import * as GOBL from "../lib/gobl";
  import { keypair, editor, envelope } from "./stores";
  import Button from "../ui/Button.svelte";
  import { createNotification, Severity } from "./notifications";

  let buildable = false;
  // TODO: When "sealing" has been implemented, `verifiable` should become true
  // once sealed.
  let verifiable = false;

  editor.subscribe((value) => {
    try {
      JSON.parse(value);
      buildable = true;
    } catch (e) {
      buildable = false;
    }
  });

  $: buildEnabled = Boolean($keypair) && buildable;
  $: verifyEnabled = Boolean($keypair) && $envelope && verifiable;

  function encodeUTF8ToBase64(value: string): string {
    return base64.encode(utf8.encode(value));
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

      createNotification({
        severity: Severity.Success,
        message: "Document successfully built.",
      });
    } catch (e) {
      createNotification({
        severity: Severity.Error,
        message: "Failed to build document.",
        context: e,
      });
    }
  }

  async function handleVerifyClick() {
    const envelopeValue = $envelope;
    envelopeValue.doc = JSON.parse($editor);

    const payload = {
      data: encodeUTF8ToBase64(JSON.stringify(envelopeValue)),
      publickey: $keypair.public,
    };

    try {
      await GOBL.verify({ payload, indent: true });
      createNotification({
        severity: Severity.Success,
        message: "Document successfully verified.",
      });
    } catch (e) {
      createNotification({
        severity: Severity.Error,
        message: "Document verification failed.",
        context: e,
      });
    }
  }
</script>

<div class="flex gap-2">
  <Button on:click={handleBuildClick} disabled={!buildEnabled}>Build</Button>
  <Button on:click={handleVerifyClick} disabled={!verifyEnabled}>Verify</Button>
</div>
