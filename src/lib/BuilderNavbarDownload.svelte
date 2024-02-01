<script lang="ts">
  import { Icon } from "@steeze-ui/svelte-icon";
  import { iconButtonClasses } from "./ui/iconButtonClasses";
  import { DocumentText, Download } from "@invopop/ui-icons";
  import LoadingIcon from "./ui/LoadingIcon.svelte";
  import { createEventDispatcher } from "svelte";
  import { toasts } from "svelte-toasts";

  const pdfApiBaseUrl = "https://pdf.invopop.com";

  const dispatch = createEventDispatcher();

  export let disabled = false;

  let generatingPDF = false;

  export let envelope = "";

  async function previewPDF() {
    const formData = new FormData();
    formData.append("envelope", new Blob([envelope]));

    generatingPDF = true;

    try {
      const res = await fetch(`${pdfApiBaseUrl}/api`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const message = "The PDF service returned an error:";
        const context = `${await res.text()} (HTTP status: ${res.status})`;
        toasts.add({
          type: "error",
          description: `${message} ${context}`,
        });
        return;
      }

      const data = await res.blob();
      const url = URL.createObjectURL(data);
      window.open(url);
    } catch (e) {
      toasts.add({
        type: "error",
        description: `Failed to fetch PDF: ${e as string}`,
      });
    } finally {
      generatingPDF = false;
    }
  }
</script>

<button title="Preview document as PDF" on:click={previewPDF} class={iconButtonClasses(disabled)} {disabled}>
  {#if generatingPDF}
    <LoadingIcon />
  {:else}
    <Icon src={DocumentText} class="w-5 h-5" />
  {/if}
</button>

<button
  title="Preview and download document"
  on:click={() => {
    dispatch("action", "downloadJson");
  }}
  class={iconButtonClasses(disabled)}
  {disabled}
>
  <Icon src={Download} class="w-5 h-5" />
</button>
