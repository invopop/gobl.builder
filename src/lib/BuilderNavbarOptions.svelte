<script lang="ts">
  import { Edit, Preview } from "@invopop/ui-icons";
  import { Icon } from "@steeze-ui/svelte-icon";
  import type { State } from "./types/editor";

  export let forceReadOnly = false;
  export let state: State = "init";
</script>

<div class="inline-flex text-white space-x-1 p-0.5 rounded border border-gobl-300">
  <button
    disabled={state === "signed"}
    title="Edit"
    class:enabled:bg-gobl-300={!forceReadOnly}
    class="rounded p-1 disabled:text-gobl-300 disabled:cursor-not-allowed enabled:hover:text-gobl-50"
    on:click={() => {
      forceReadOnly = false;
    }}
  >
    <Icon src={Edit} class="h-5 w-5" />
  </button>
  <button
    disabled={state === "signed"}
    title="Read Only"
    class:enabled:bg-gobl-300={forceReadOnly}
    class="rounded p-1 disabled:text-gobl-300 disabled:cursor-not-allowed enabled:hover:text-gobl-50"
    on:click={() => {
      forceReadOnly = true;
    }}
  >
    <Icon src={Preview} class="h-5 w-5" />
  </button>
</div>
