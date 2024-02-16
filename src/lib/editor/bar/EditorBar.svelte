<script lang="ts">
  import { Code, List } from "@invopop/ui-icons";
  import { Icon } from "svelte-hero-icons";

  export let editorView = "code";
</script>

<div class="inline-flex space-x-0.5 p-0.5 rounded bg-neutral-100">
  <button
    title="Form view"
    class:bg-white={editorView === "form"}
    class="{editorView === 'form'
      ? 'text-neutral-800'
      : 'text-neutral-500 '} rounded p-1 hover:bg-white hover:text-neutral-800"
    on:click={() => {
      editorView = "form";
    }}
  >
    <Icon src={List} class="h-5 w-5" />
  </button>
  <button
    title="Code view"
    class:bg-white={editorView === "code"}
    class="{editorView === 'code'
      ? 'text-neutral-800'
      : 'text-neutral-500 '} rounded p-1 hover:bg-white hover:text-neutral-800"
    on:click={() => {
      editorView = "code";
    }}
  >
    <Icon src={Code} class="h-5 w-5" />
  </button>
</div>
