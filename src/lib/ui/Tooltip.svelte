<script lang="ts">
  import { writable } from "svelte/store";
  import { offset, flip, shift } from "@floating-ui/dom";
  import { createFloatingActions, arrow } from "svelte-floating-ui";
  import type { Placement } from "@floating-ui/utils";

  export let placement: Placement = "top";

  const arrowRef = writable<HTMLElement>();
  const [floatingRef, floatingContent] = createFloatingActions({
    strategy: "fixed",
    placement,
    middleware: [offset(6), flip(), shift({ padding: 5 }), arrow({ element: arrowRef })],
    onComputed({ placement, middlewareData }) {
      const { x, y } = middlewareData.arrow || { x: undefined, y: undefined };
      const staticSide = {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right",
      }[placement.split("-")[0]];

      if ($arrowRef) {
        Object.assign($arrowRef.style, {
          left: x !== undefined ? `${x}px` : "",
          top: y !== undefined ? `${y}px` : "",
          [staticSide as string]: "-4px",
        });
      }
    },
  });

  export let label: string | undefined = undefined;
  export let delay = false;
  export let containerClass = "inline-block";
  export let bgClass = "bg-gray-900";

  $: delayClasses = delay ? "transition-all ease-in-out duration-300 delay-1000" : "";

  let showTooltip = false;
</script>

{#if !label && !$$slots.content}
  <slot />
{:else}
  <div
    role="contentinfo"
    class={containerClass}
    use:floatingRef
    on:mouseenter={(event) => {
      event.stopPropagation();
      showTooltip = true;
    }}
    on:mouseleave={() => {
      showTooltip = false;
    }}
  >
    <slot />
  </div>

  <div
    class="py-1 px-2 text-xs text-white {bgClass} rounded-lg {delayClasses} z-20"
    class:visible={showTooltip}
    class:invisible={!showTooltip}
    class:opacity-100={showTooltip}
    class:opacity-0={!showTooltip}
    use:floatingContent
  >
    {#if label}
      {label}
    {:else}
      <slot name="content" />
    {/if}
    <div class="{bgClass} w-2 h-2 absolute rotate-45" bind:this={$arrowRef} />
  </div>
{/if}
