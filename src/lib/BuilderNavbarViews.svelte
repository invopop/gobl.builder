<script lang="ts">
  import { Code, Preview } from "@invopop/ui-icons";
  import { Icon } from "@steeze-ui/svelte-icon";

  export let editorView = "form";
</script>

<div class="inline-flex text-white space-x-1 p-0.5 rounded border border-neutral-300">
  <button
    class:bg-neutral-300={editorView === "form"}
    class="rounded p-1"
    on:click={() => {
      editorView = "form";
    }}
  >
    <Icon src={Preview} class="h-5 w-5" />
  </button>
  <button
    class:bg-neutral-300={editorView === "code"}
    class="rounded p-1"
    on:click={() => {
      editorView = "code";
    }}
  >
    <Icon src={Code} class="h-5 w-5" />
  </button>
</div>
