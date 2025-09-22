<script lang="ts">
  import clsx from "clsx";
  import { createEventDispatcher } from "svelte";
  import { Icon, type IconSource } from "svelte-hero-icons";

  interface Props {
    icon: IconSource;
    confirmationIcon?: IconSource | null;
    tooltipText?: string;
    isDestructive?: boolean;
    disabled?: boolean;
  }

  let {
    icon,
    confirmationIcon = null,
    tooltipText = "",
    isDestructive = false,
    disabled = false
  }: Props = $props();

  let needsConfirmation = $state(false);

  let buttonIcon = $derived(!isDestructive ? icon : needsConfirmation ? confirmationIcon : icon);

  let classes = $derived(clsx({
    "hover:bg-danger-500 hover:text-white text-danger-500": isDestructive,
    "hover:bg-neutral-100 text-neutral-800": !isDestructive && !disabled,
    "bg-neutral-100 text-neutral-500": disabled,
    "bg-white": !disabled,
  }));

  const dispatch = createEventDispatcher();

  const handleClick = () => {
    if (isDestructive && !needsConfirmation) {
      needsConfirmation = true;
      setTimeout(() => {
        needsConfirmation = false;
      }, 3000);
      return;
    }

    needsConfirmation = false;

    dispatch("click");
  };
</script>

<button
  title={tooltipText}
  {disabled}
  onclick={handleClick}
  class="{classes} flex items-center justify-start w-full h-6 px-[4px] py-[3px] rounded"
>
  <Icon src={buttonIcon} class="h-4 w-4" />
  {#if isDestructive && needsConfirmation}
    <span class="text-sm ml-1">Sure?</span>
  {/if}
</button>
