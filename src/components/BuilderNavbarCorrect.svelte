<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { State } from "./types/editor";
  import { Icon } from "svelte-hero-icons";
  import { Erase } from "@invopop/ui-icons";
  import { iconButtonClasses } from "./ui/iconButtonClasses";

  interface Props {
    state?: State;
  }

  let { state = "init" }: Props = $props();

  const dispatch = createEventDispatcher();
</script>

<button
  title="Correct document."
  onclick={() => {
    dispatch("action", "correct");
  }}
  class={iconButtonClasses}
  disabled={!["loaded", "built", "signed"].includes(state)}
>
  <Icon src={Erase} class="w-5 h-5" />
</button>
