<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import clsx from "clsx";
  import { Icon, type IconSource } from "@steeze-ui/svelte-icon";

  type ButtonVariant = "default" | "primary" | "danger";

  interface Props {
    icon?: IconSource | undefined;
    variant?: ButtonVariant;
    disabled?: boolean;
    children?: import('svelte').Snippet;
    [key: string]: any
  }

  let {
    icon = undefined,
    variant = "default",
    disabled = false,
    children,
    ...rest
  }: Props = $props();

  let buttonStyles = $derived(clsx(
    { "opacity-30 pointer-events-none": disabled },
    { "bg-workspace-accent-500": variant === "primary" },
    { "bg-neutral-100": variant === "default" },
    { "bg-danger-500": variant === "danger" },
    { "px-3": children && !icon },
    { "pl-2 pr-3": children && icon },
    { "py-[5px]": children },
    { "p-1.5": !children },
    { "text-white": ["primary", "danger"].includes(variant) },
    { "text-neutral-800": ["default"].includes(variant) },
    { "space-x-1": icon && children },
  ));

  let iconStyles = $derived(clsx(
    { "text-neutral-500": ["default"].includes(variant) && children },
    { "text-neutral-800": ["default"].includes(variant) && !children },
    { "text-white-70": !["default"].includes(variant) && children },
    { "text-white": !["default"].includes(variant) && !children },
  ));

  let overlayClasses = $derived(clsx({
    "group-hover:bg-black/[.16] group-active:bg-black/[.32]": ["primary", "danger", "dark"].includes(variant),
    "group-hover:bg-black/[.04] group-active:bg-black/[.12]": ["secondary"].includes(variant),
  }));
</script>

<button
  type="button"
  {disabled}
  class="{buttonStyles} flex items-center justify-center rounded font-medium font-sans relative group"
  {...rest}
  onclick={bubble('click')}
>
  <span class="{overlayClasses} absolute inset-0 rounded"></span>
  {#if icon}
    <Icon src={icon} class="{iconStyles} h-5 w-5 z-10" />
  {/if}
  {#if children}
    <span class="z-10">{@render children?.()}</span>
  {/if}
</button>
