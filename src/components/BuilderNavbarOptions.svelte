<script lang="ts">
  import { Edit, Preview } from "@invopop/ui-icons";
  import { Icon } from "@steeze-ui/svelte-icon";
  import type { State } from "./types/editor";

  interface Props {
    forceReadOnly?: boolean;
    state?: State;
  }

  let { forceReadOnly = $bindable(false), state = "init" }: Props = $props();
</script>

<div class="inline-flex text-white space-x-1 p-0.5 rounded border border-gobl-300">
  <button
    disabled={state === "signed"}
    title="Edit"
    class:enabled:bg-gobl-300={!forceReadOnly}
    class="rounded p-1 disabled:text-gobl-300 disabled:cursor-not-allowed enabled:hover:text-gobl-50"
    onclick={() => {
      forceReadOnly = false;
    }}
  >
    <Icon src={Edit} class="h-5 w-5" />
  </button>
  <button
    title="Read Only"
    class:bg-gobl-300={forceReadOnly || state === "signed"}
    class="rounded p-1 disabled:text-gobl-300 disabled:cursor-not-allowed enabled:hover:text-gobl-50"
    onclick={() => {
      forceReadOnly = true;
    }}
  >
    <Icon src={Preview} class="h-5 w-5" />
  </button>
</div>
