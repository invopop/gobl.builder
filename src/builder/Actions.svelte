<script lang="ts">
  import * as GOBL from "../lib/gobl";
  import { keypair, editor, draft, status } from "./stores";
  import Button from "../ui/Button.svelte";
  import { Severity } from "../ui/alerts";

  let envelopable = false;
  let buildable = false;
  let verifiable = false;

  editor.subscribe((value) => {
    try {
      const data = JSON.parse(value);
      if (data?.$schema !== "https://gobl.org/draft-0/envelope") {
        envelopable = true;
        buildable = false;
        verifiable = false;
      } else {
        envelopable = false;
        buildable = true;
        verifiable = true;
      }
    } catch (e) {
      envelopable = false;
      buildable = false;
      verifiable = false;
    }
  });

  $: envelopEnabled = Boolean($keypair) && envelopable;
  $: buildEnabled = Boolean($keypair) && buildable;
  $: verifyEnabled = Boolean($keypair) && verifiable;

  async function handleEnvelopClick() {
    const payload = {
      data: btoa($editor),
      privatekey: $keypair.private,
      draft: $draft,
    };

    try {
      const result = await GOBL.envelop({ payload, indent: true });
      editor.set(result);
      status.set({
        severity: Severity.Success,
        message: "Successfully wrapped document in an envelope.",
      });
    } catch (e) {
      status.set({
        severity: Severity.Error,
        message: "Failed to wrap document in an envelope.",
        context: e,
      });
    }
  }

  async function handleBuildClick() {
    const payload = {
      data: btoa($editor),
      privatekey: $keypair.private,
      draft: $draft,
    };

    try {
      const result = await GOBL.build({ payload, indent: true });
      editor.set(result);
      status.set({
        severity: Severity.Success,
        message: "Document successfully built.",
      });
    } catch (e) {
      status.set({
        severity: Severity.Error,
        message: "Failed to build document.",
        context: e,
      });
    }
  }

  async function handleVerifyClick() {
    const payload = {
      data: btoa($editor),
      publickey: $keypair.public,
    };

    try {
      await GOBL.verify({ payload, indent: true });
      status.set({
        severity: Severity.Success,
        message: "Document successfully verified.",
      });
    } catch (e) {
      status.set({
        severity: Severity.Error,
        message: "Document verification failed.",
        context: e,
      });
    }
  }
</script>

<div class="flex gap-2">
  <div class="flex items-center">
    <input
      id="draft"
      bind:checked={$draft}
      type="checkbox"
      class="form-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
    />
    <label for="draft" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Draft</label>
  </div>
  <Button
    on:click={handleEnvelopClick}
    disabled={!envelopEnabled}
    title={!envelopEnabled ? "Document schema is not supported for enveloping." : ""}>Envelop</Button
  >
  <Button on:click={handleBuildClick} disabled={!buildEnabled}>Build</Button>
  <Button on:click={handleVerifyClick} disabled={!verifyEnabled}>Verify</Button>
</div>
