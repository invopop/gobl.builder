<script lang="ts">
  import { writable } from "svelte/store";
  import { offset, flip, shift } from "@floating-ui/dom";
  import { createFloatingActions, arrow } from "svelte-floating-ui";

  const arrowRef = writable<HTMLElement>();
  const [floatingRef, floatingContent] = createFloatingActions({
    strategy: "absolute",
    placement: "top",
    middleware: [offset(6), flip(), shift({ padding: 5 }), arrow({ element: arrowRef })],
    onComputed({ placement, middlewareData }) {
      const { x, y } = middlewareData.arrow!;
      const sides = new Map<string, string>([
        ["top", "bottom"],
        ["right", "left"],
        ["bottom", "left"],
        ["left", "right"],
      ]);
      const staticSide = sides.get(placement.split("-")[0]);

      if ($arrowRef != null) {
        Object.assign($arrowRef.style, {
          left: x != null ? `${x}px` : "",
          top: y != null ? `${y}px` : "",
          [staticSide as string]: "-4px",
        });
      }
    },
  });

  export let label: string;
  let showTooltip = false;
</script>

<div
  class="inline-block"
  role="tooltip"
  use:floatingRef
  on:mouseenter={() => {
    showTooltip = true;
  }}
  on:mouseleave={() => {
    showTooltip = false;
  }}
>
  <slot />
</div>

<div
  class="py-1 px-2 text-xs text-white bg-gray-900 rounded-lg"
  class:visible={showTooltip}
  class:invisible={!showTooltip}
  use:floatingContent
>
  {label}
  <div class="bg-gray-900 w-2 h-2 absolute rotate-45" bind:this={$arrowRef} />
</div>
