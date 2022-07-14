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
  let previewLoading = false;

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

  async function handlePreviewPDFClick() {
    const formData = new FormData();
    formData.append("envelope", new Blob([JSON.stringify($envelope)]));

    previewLoading = true;

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

      const data = await res.blob();
      previewLoading = false;
      window.open(URL.createObjectURL(data));
    } catch (e) {
      createNotification({
        severity: Severity.Error,
        message: "Failed to fetch PDF.",
        context: e,
      });
    }
  }

  function handleDownloadEnvelopeJSON() {
    const filename = $envelope.head.uuid + ".json";
    fileSaver.saveAs(new Blob([JSON.stringify($envelope, null, 4)]), filename);

    createNotification({
      severity: Severity.Success,
      message: "Downloaded JSON file of GOBL document.",
    });
  }
</script>

<div class="flex gap-2">
  <div>
    <div
      id="tooltip-preview-pdf"
      role="tooltip"
      class="inline-block absolute invisible z-10 py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
    >
      Preview PDF of last built document.
      <div class="tooltip-arrow" data-popper-arrow />
    </div>
    <button
      data-tooltip-target="tooltip-preview-pdf"
      class={classNames(
        "p-2 bg-gray-100 hover:bg-sky-200 focus:ring-4 focus:ring-sky-300 focus:outline-none rounded-lg",
        {
          hidden: !envelopeExists,
        }
      )}
      on:click={handlePreviewPDFClick}
    >
      {#if previewLoading}
        <svg
          role="status"
          class="w-5 h-5 text-gray-500 animate-spin  fill-gray-300"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clip-rule="evenodd"
          />
        </svg>
      {/if}
    </button>
  </div>
  <div>
    <div
      id="tooltip-download-json"
      role="tooltip"
      class="inline-block absolute invisible z-10 py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
    >
      Download JSON of last built GOBL document.
      <div class="tooltip-arrow" data-popper-arrow />
    </div>
    <button
      data-tooltip-target="tooltip-download-json"
      class={classNames(
        "p-2 bg-gray-100 hover:bg-sky-200 focus:ring-4 focus:ring-sky-300 focus:outline-none rounded-lg",
        {
          hidden: !envelopeExists,
        }
      )}
      on:click={handleDownloadEnvelopeJSON}
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
