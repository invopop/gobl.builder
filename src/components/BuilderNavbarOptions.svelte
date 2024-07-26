<script lang="ts">
  import { Edit, Preview } from "@invopop/ui-icons";
  import { Icon } from "@steeze-ui/svelte-icon";

  export let forceReadOnly = false;
</script>

<div class="inline-flex text-white space-x-1 p-0.5 rounded border border-gobl-300">
  <button
    title="Edit"
    class:bg-gobl-300={!forceReadOnly}
    class="rounded p-1"
    on:click={() => {
      forceReadOnly = false;
    }}
  >
    <Icon src={Edit} class="h-5 w-5 hover:text-gobl-50" />
  </button>
  <button
    title="Read Only"
    class:bg-gobl-300={forceReadOnly}
    class="rounded p-1"
    on:click={() => {
      forceReadOnly = true;
    }}
  >
    <Icon src={Preview} class="h-5 w-5 hover:text-gobl-50" />
  </button>
</div>
