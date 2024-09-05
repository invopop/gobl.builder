<script lang="ts">
  import clsx from "clsx";
  import { Icon, type IconSource } from "@steeze-ui/svelte-icon";

  type ButtonVariant = "default" | "primary" | "danger";

  export let icon: IconSource | undefined = undefined;
  export let variant: ButtonVariant = "default";
  export let disabled = false;

  $: buttonStyles = clsx(
    { "opacity-30 pointer-events-none": disabled },
    { "bg-workspace-accent-500": variant === "primary" },
    { "bg-neutral-100": variant === "default" },
    { "bg-danger-500": variant === "danger" },
    { "px-3": $$slots.default && !icon },
    { "pl-2 pr-3": $$slots.default && icon },
    { "py-[5px]": $$slots.default },
    { "p-1.5": !$$slots.default },
    { "text-white": ["primary", "danger"].includes(variant) },
    { "text-neutral-800": ["default"].includes(variant) },
    { "space-x-1": icon && $$slots.default },
  );

  $: iconStyles = clsx(
    { "text-neutral-500": ["default"].includes(variant) && $$slots.default },
    { "text-neutral-800": ["default"].includes(variant) && !$$slots.default },
    { "text-white-70": !["default"].includes(variant) && $$slots.default },
    { "text-white": !["default"].includes(variant) && !$$slots.default },
  );

  $: overlayClasses = clsx({
    "group-hover:bg-black/[.16] group-active:bg-black/[.32]": ["primary", "danger", "dark"].includes(variant),
    "group-hover:bg-black/[.04] group-active:bg-black/[.12]": ["secondary"].includes(variant),
  });
</script>

<button
  type="button"
  {disabled}
  class="{buttonStyles} flex items-center justify-center rounded font-medium font-sans relative group"
  {...$$restProps}
  on:click
>
  <span class="{overlayClasses} absolute inset-0 rounded" />
  {#if icon}
    <Icon src={icon} class="{iconStyles} h-5 w-5 z-10" />
  {/if}
  {#if $$slots.default}
    <span class="z-10"><slot /></span>
  {/if}
</button>
