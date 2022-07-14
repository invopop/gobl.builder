<script lang="ts">
  import utf8 from "utf8";
  import base64 from "base-64";
  import classNames from "classnames";
  import fileSaver from "file-saver";

  import * as GOBL from "../lib/gobl";
  import { keypair, editor, envelope, goblError, GOBLError } from "./stores";
  import Button from "../ui/Button.svelte";
  import { createNotification, Severity } from "./notifications";

  const pdfApiBaseUrl = import.meta.env.VITE_PDF_API_BASE_URL;

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
  $: envelopeExists = Boolean($envelope);

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

  async function handleDownloadPDFClick() {
    const formData = new FormData();
    formData.append("envelope", new Blob([JSON.stringify($envelope)]));

    try {
      const res = await fetch(`${pdfApiBaseUrl}/api`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        createNotification({
          severity: Severity.Error,
          message: "The PDF service returned an error:",
          context: `${await res.text()} (HTTP status: ${res.status})`,
        });
        return;
      }

      fileSaver.saveAs(await res.blob(), "download.pdf");

      createNotification({
        severity: Severity.Success,
        message: "Downloaded PDF file.",
      });
    } catch (e) {
      createNotification({
        severity: Severity.Error,
        message: "Failed to download PDF.",
        context: e,
      });
    }
  }
</script>

<div class="flex gap-2">
  <div>
    <div
      id="tooltip-download-pdf"
      role="tooltip"
      class="inline-block absolute invisible z-10 py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
    >
      Download PDF of last built document.
      <div class="tooltip-arrow" data-popper-arrow />
    </div>
    <button
      data-tooltip-target="tooltip-download-pdf"
      class={classNames("p-2 hover:bg-gray-200 rounded-lg", {
        hidden: !envelopeExists,
      })}
      on:click={handleDownloadPDFClick}
      ><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg></button
    >
  </div>
  <div>
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
    <Button on:click={handleBuildClick} data-tooltip-target="tooltip-build" disabled={!buildEnabled}>Build</Button>
  </div>
</div>
