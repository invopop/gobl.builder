<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { State } from "./types/editor";
  import { Icon } from "svelte-hero-icons";
  import { Erase } from "@invopop/ui-icons";
  import { iconButtonClasses } from "./ui/iconButtonClasses";

  export let state: State = "init";

  const dispatch = createEventDispatcher();
</script>

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
