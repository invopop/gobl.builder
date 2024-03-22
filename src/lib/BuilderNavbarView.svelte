<script lang="ts">
  import { Block, Code } from "@invopop/ui-icons";
  import { Icon } from "@steeze-ui/svelte-icon";

  export let editorView = "code";
</script>

<div class="inline-flex text-white space-x-1 p-0.5 rounded border border-gobl-300">
  <button
    title="Form view"
    class:bg-gobl-300={editorView === "form"}
    class="rounded p-1"
    on:click={() => {
      editorView = "form";
    }}
  >
    <Icon src={Block} class="h-5 w-5 hover:text-gobl-50" />
  </button>
  <button
    title="Developer Mode"
    class:bg-gobl-300={editorView === "code"}
    class="rounded p-1"
    on:click={() => {
      editorView = "code";
    }}
  >
    <Icon src={Code} class="h-5 w-5 hover:text-gobl-50" />
  </button>
</div>
