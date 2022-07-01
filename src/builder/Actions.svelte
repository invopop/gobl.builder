<script lang="ts">
  import * as GOBL from "../lib/gobl";
  import { keypair, editor } from "./stores";
  import Button from "../ui/Button.svelte";

  let docEnvelopable = false;

  editor.subscribe((value) => {
    try {
      const data = JSON.parse(value);
      docEnvelopable = data?.$schema === "https://gobl.org/draft-0/bill/invoice";
    } catch (e) {
      docEnvelopable = false;
    }
  });

  $: envelopEnabled = Boolean($keypair) && docEnvelopable;

  async function handleEnvelopClick() {
    const payload = {
      data: btoa($editor),
      privatekey: $keypair.private,
    };

    try {
      const result = await GOBL.envelop({ payload, indent: true });
      editor.set(result);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleBuildClick() {
    const payload = {
      data: btoa($editor),
      privatekey: $keypair.private,
    };

    try {
      const result = await GOBL.build({ payload, indent: true });
      // TODO: Handle result.
    } catch (e) {
      console.error(e);
    }
  }

  async function handleVerifyClick() {
    const payload = {
      data: btoa($editor),
      publickey: $keypair.public,
    };

    try {
      const result = await GOBL.verify({ payload, indent: true });
      // TODO: Handle result.
    } catch (e) {
      console.error(e);
    }
  }
</script>

<Button
  on:click={handleEnvelopClick}
  disabled={!envelopEnabled}
  title={!envelopEnabled ? "Document schema is not supported for enveloping." : ""}>Envelop</Button
>
<!-- <Button on:click={handleBuildClick} disabled={!Boolean($keypair)}>Build</Button> -->
<!-- <Button on:click={handleVerifyClick} disabled={!Boolean($keypair)}>Verify</Button> -->
