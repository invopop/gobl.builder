<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Icon } from "@steeze-ui/svelte-icon";
  import { Header, Signature } from "@invopop/ui-icons";
  import type { State } from "./types/editor";
  import { iconButtonClasses } from "./ui/iconButtonClasses";

  const dispatch = createEventDispatcher();

  export let state: State = "init";
</script>

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
