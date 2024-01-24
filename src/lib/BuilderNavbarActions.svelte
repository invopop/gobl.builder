<script lang="ts">
  import { iconButtonClasses } from "./ui/iconButtonClasses";
  import type { State } from "./types/editor";
  import { Icon } from "@steeze-ui/svelte-icon";
  import { Calculator, Erase, Sign, SquareCheck } from "@invopop/ui-icons";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let state: State = "init";
</script>

<div class="flex space-x-1 items-center">
  <button
    title="Build the GOBL document."
    class={iconButtonClasses(state !== "modified" && state !== "loaded" && state !== "errored")}
    disabled={state !== "modified" && state !== "loaded" && state !== "errored"}
    on:click={() => {
      dispatch("action", "build");
    }}
  >
    <Icon src={Calculator} class="w-5 h-5" />
  </button>
  <button
    title="Correct document."
    on:click={() => {
      dispatch("action", "correct");
    }}
    class={iconButtonClasses(!["loaded", "built", "signed"].includes(state))}
    disabled={!["loaded", "built", "signed"].includes(state)}
  >
    <Icon src={Erase} class="w-5 h-5" />
  </button>
  <button
    title="Sign document."
    on:click={() => {
      dispatch("action", "sign");
    }}
    class={iconButtonClasses(state !== "built")}
    disabled={state !== "built"}
  >
    <Icon src={Sign} class="w-5 h-5" />
  </button>
  <button
    title="Validate a signed GOBL document."
    on:click={() => {
      dispatch("action", "validate");
    }}
    class={iconButtonClasses(state === "errored" || state !== "signed")}
    disabled={state === "errored" || state !== "signed"}
  >
    <Icon src={SquareCheck} class="w-5 h-5" />
  </button>
</div>
