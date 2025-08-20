<script lang="ts">
  import { Icon } from "@steeze-ui/svelte-icon";
  import { iconButtonClasses } from "./ui/iconButtonClasses";
  import { Invoice, Download, Header, Signature } from "@invopop/ui-icons";
  import LoadingIcon from "./ui/LoadingIcon.svelte";
  import { createEventDispatcher } from "svelte";
  import { toasts } from "svelte-toasts";
  import type { State } from "./types/editor";

  const pdfApiBaseUrl = "https://pdf.invopop.com";

  const dispatch = createEventDispatcher();

  export let disabled = false;
  export let state: State = "init";

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

<div class="flex items-center space-x-2">
  <button
    title="Show document headers"
    class={iconButtonClasses}
    on:click={() => {
      dispatch("action", "showHeaders");
    }}
  >
    <Icon src={Header} class="h-5 w-5" />
  </button>
  <button
    title="Show document signatures"
    class={iconButtonClasses}
    disabled={state !== "signed"}
    on:click={() => {
      dispatch("action", "showSignatures");
    }}
  >
    <Icon src={Signature} class="h-5 w-5" />
  </button>

  <button title="Preview document as PDF" on:click={previewPDF} class={iconButtonClasses} {disabled}>
    {#if generatingPDF}
      <LoadingIcon />
    {:else}
      <Icon src={Invoice} class="w-5 h-5" />
    {/if}
  </button>

  <button
    title="Preview and download document"
    on:click={() => {
      dispatch("action", "downloadJson");
    }}
    class={iconButtonClasses}
    {disabled}
  >
    <Icon src={Download} class="w-5 h-5" />
  </button>
</div>
