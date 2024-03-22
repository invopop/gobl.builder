<script lang="ts">
  import { Code, Block } from "@invopop/ui-icons";
  import { Icon } from "svelte-hero-icons";

  export let editorView = "code";
</script>

<div class="inline-flex space-x-0.5 p-0.5 rounded-md bg-neutral-100 border border-neutral-200">
  <button
    title="Form view"
    class:bg-white={editorView === "form"}
    class="{editorView === 'form' ? 'text-neutral-800' : 'text-neutral-400 '} rounded p-1"
    on:click={() => {
      editorView = "form";
    }}
  >
    <Icon src={Block} class="h-4 w-4" />
  </button>
  <button
    title="Code view"
    class:bg-white={editorView === "code"}
    class="{editorView === 'code' ? 'text-neutral-800' : 'text-neutral-400 '} rounded p-1"
    on:click={() => {
      editorView = "code";
    }}
  >
    <Icon src={Code} class="h-4 w-4" />
  </button>
</div>
