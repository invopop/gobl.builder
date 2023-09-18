<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import fileSaver from "file-saver";
  import * as CountryList from "country-list";

  import { envelope, envelopeDocumentSchema } from "$lib/editor/stores.js";
  import { Severity, createNotification } from "$lib/notifications/index.js";
  import { schemaIconMap } from "$lib/ui/icons/schemaIconMap.svelte";
  import DocIcon from "$lib/ui/DocIcon.svelte";
  import LoadingIcon from "$lib/ui/LoadingIcon.svelte";

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

  $: invoiceCountryCode = $envelope?.doc?.supplier?.tax_id?.country as string | undefined;
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

    const filename = ($envelope.head?.uuid || "gob") + ".json";
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
        <LoadingIcon />
      {:else if $envelope && $envelope.doc}
        <svelte:component this={schemaIconMap.get(envelopeDocumentSchema($envelope))} />
      {:else}
        <svelte:component this={DocIcon} />
      {/if}
      PDF Preview
    </button>
    <p class="text-gray-400">Powered by Invopop</p>
  </div>
</div>
