<script lang="ts">
  import { Icon } from "@steeze-ui/svelte-icon";
  import { envelope } from "./editor/stores";
  import { iconButtonClasses } from "./ui/iconButtonClasses";
  import { DocumentText, Download } from "@invopop/ui-icons";
  import LoadingIcon from "./ui/LoadingIcon.svelte";
  import { createEventDispatcher } from "svelte";
  import { generatingPDF } from "./ui/store";

  const dispatch = createEventDispatcher();

  $: envelopeExists = Boolean($envelope);
</script>

<button
  title="Preview document as PDF"
  on:click={() => {
    dispatch("action", "previewPDF");
  }}
  class={iconButtonClasses(!envelopeExists)}
>
  {#if $generatingPDF}
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
  class={iconButtonClasses(!envelopeExists)}
>
  <Icon src={Download} class="w-5 h-5" />
</button>
