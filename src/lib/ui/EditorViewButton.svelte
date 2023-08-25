<script lang="ts">
  import { clsx } from "clsx";
  import Tooltip from "$lib/ui/Tooltip.svelte";

  export let disabled = false;
  export let right = false;
  export let label: string | undefined = "";

  function editorViewButtonClasses(disabled: boolean, right: boolean): string {
    return clsx("py-2 px-6 rounded text-sm flex items-center justify-center gap-1", {
      "text-grey-5 font-medium": !disabled,
      "text-grey-4 bg-white shadow-right cursor-default font-medium": disabled,
      "shadow-right": !right && disabled,
      "shadow-left": right && disabled,
    });
  }
</script>

<Tooltip containerClass="block" {label}>
  <button on:click class={editorViewButtonClasses(disabled, right)}><slot /></button>
</Tooltip>
