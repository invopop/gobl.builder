<script lang="ts">
  import { clsx } from "clsx";

  export let active = false;
  export let disabled = false;
  export let right = false;
  export let label: string | undefined = "";

  function editorViewButtonClasses(active: boolean, right: boolean): string {
    return clsx("py-2 px-6 rounded text-sm flex items-center justify-center gap-1", {
      "text-grey-5 font-medium": !active,
      "text-grey-4 bg-white shadow-right cursor-default font-medium": active,
      "shadow-right": !right && active,
      "shadow-left": right && active,
    });
  }
</script>

<button
  title={label}
  {disabled}
  class:cursor-not-allowed={disabled}
  on:click
  class={editorViewButtonClasses(active, right)}><slot /></button
>
