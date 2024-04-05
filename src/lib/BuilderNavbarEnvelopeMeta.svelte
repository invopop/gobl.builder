<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Icon } from "@steeze-ui/svelte-icon";
  import { Header, Signature } from "@invopop/ui-icons";
  import { iconButtonClasses } from "./ui/iconButtonClasses";

  const dispatch = createEventDispatcher();

  export let isSigned = false;
</script>

<button
  title="Show document headers"
  class="inline-flex items-center space-x-1.5 p-1.5 border border-gobl-300 text-sm font-medium text-white hover:text-gobl-50 hover:border-gobl-50"
  on:click={() => {
    dispatch("action", "showHeaders");
  }}
>
  <Icon src={Header} class="h-5 w-5" />
</button>
<button
  title="Show document signatures"
  class={iconButtonClasses(!isSigned)}
  disabled={!isSigned}
  on:click={() => {
    dispatch("action", "showSignatures");
  }}
>
  <Icon src={Signature} class="h-5 w-5" />
</button>
