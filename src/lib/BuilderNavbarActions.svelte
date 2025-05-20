<script lang="ts">
  import { iconButtonClasses } from "./ui/iconButtonClasses";
  import type { State } from "./types/editor";
  import { Icon } from "@steeze-ui/svelte-icon";
  import { Calculator, CrumpledPaper, Sign, SquareCheck } from "@invopop/ui-icons";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let state: State = "init";
</script>

<div class="flex space-x-2 items-center">
  <button
    title="Build the GOBL document."
    class="p-1.5 rounded border border-gobl-50 disabled:border-gobl-300 text-gobl-50 disabled:text-white/30 disabled:cursor-not-allowed"
    disabled={state !== "modified" && state !== "loaded" && state !== "errored"}
    on:click={() => {
      dispatch("action", "build");
    }}
  >
    <Icon src={Calculator} class="w-5 h-5" />
  </button>
  <button
    title="Sign document."
    on:click={() => {
      dispatch("action", "sign");
    }}
    class={iconButtonClasses}
    disabled={state !== "built"}
  >
    <Icon src={Sign} class="w-5 h-5" />
  </button>
  <button
    title="Remove Signatures."
    class={iconButtonClasses}
    disabled={state !== "signed"}
    on:click={() => {
      dispatch("action", "removeSigs");
    }}
  >
    <Icon src={CrumpledPaper} class="w-5 h-5" />
  </button>
  <button
    title="Validate a signed GOBL document."
    on:click={() => {
      dispatch("action", "validate");
    }}
    class={iconButtonClasses}
    disabled={state === "errored" || state !== "signed"}
  >
    <Icon src={SquareCheck} class="w-5 h-5" />
  </button>
</div>
