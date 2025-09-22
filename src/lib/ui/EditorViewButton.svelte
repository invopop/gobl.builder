<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import { clsx } from "clsx";

  interface Props {
    active?: boolean;
    disabled?: boolean;
    right?: boolean;
    label?: string | undefined;
    children?: import('svelte').Snippet;
  }

  let {
    active = false,
    disabled = false,
    right = false,
    label = "",
    children
  }: Props = $props();

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
  onclick={bubble('click')}
  class={editorViewButtonClasses(active, right)}>{@render children?.()}</button
>
