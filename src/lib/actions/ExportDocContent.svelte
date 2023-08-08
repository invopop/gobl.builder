<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import fileSaver from "file-saver";
  import * as CountryList from "country-list";

  import { envelope } from "$lib/stores.js";
  import { createNotification, Severity } from "$lib/notifications/index.js";
  import { schemaIconMap } from "$lib/ui/icons/schemaIconMap.svelte";
  import DocIcon from "$lib/ui/DocIcon.svelte";

  const pdfApiBaseUrl = "https://pdf.invopop.com";
  const flagsBaseUrl = "https://cdnjs.cloudflare.com/ajax/libs/flag-icons/6.6.4/flags/4x3/";

  const dispatch = createEventDispatcher<{
    download: {
      error?: Error;
    };
    preview: {
      url?: string;
      error?: Error;
    };
  }>();

  let previewLoading = false;

  $: invoiceCountryCode = $envelope?.doc.supplier?.tax_id?.country as string | undefined;
  $: countryName = CountryList.getName(invoiceCountryCode || "");

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
        const message = "The PDF service returned an error:";
        const context = `${await res.text()} (HTTP status: ${res.status})`;
        dispatch("preview", {
          error: new Error(`${message} ${context}`),
        });
        createNotification({
          severity: Severity.Error,
          message,
          context,
        });
        return;
      }

      const data = await res.blob();
      const url = URL.createObjectURL(data);
      dispatch("preview", {
        url,
      });
      window.open(url);
    } catch (e) {
      createNotification({
        severity: Severity.Error,
        message: "Failed to fetch PDF.",
        context: e as string,
      });
    } finally {
      previewLoading = false;
    }
  }

  function handleDownloadEnvelopeJSON() {
    if (!$envelope) {
      return;
    }

    const filename = $envelope.head.uuid + ".json";
    fileSaver.saveAs(new Blob([JSON.stringify($envelope, null, 4)]), filename);

    dispatch("download", {});
    createNotification({
      severity: Severity.Success,
      message: "Downloaded JSON file of GOBL document.",
    });
  }
</script>

<div class="space-y-6">
  <button class="inline-flex gap-2 items-center hover:text-sky-500" on:click={() => handleDownloadEnvelopeJSON()}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
        clip-rule="evenodd"
      />
    </svg>
    Download
  </button>

  <div>
    {#if countryName && invoiceCountryCode}
      <h3 class="uppercase font-semibold flex gap-2 items-center mb-3">
        <img src={`${flagsBaseUrl}${invoiceCountryCode.toLowerCase()}.svg`} class="h-4" alt="Country flag" />
        <span>{countryName}</span>
      </h3>
    {/if}
    <button class="inline-flex gap-2 items-center hover:text-sky-500 mb-3" on:click={() => handlePreviewPDFClick()}>
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
      {:else if $envelope}
        <svelte:component this={schemaIconMap.get($envelope.doc.$schema)} />
      {:else}
        <svelte:component this={DocIcon} />
      {/if}
      PDF Preview
    </button>
    <p class="text-gray-400">Powered by Invopop</p>
  </div>
</div>
