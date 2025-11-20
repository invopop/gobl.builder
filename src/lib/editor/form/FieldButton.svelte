<script lang="ts">
  import type { FieldButtonProps } from '$lib/types/editor'
  import clsx from 'clsx'
  import { Icon } from 'svelte-hero-icons'

  let {
    icon,
    confirmationIcon = null,
    tooltipText = '',
    isDestructive = false,
    disabled = false,
    onClick
  }: FieldButtonProps = $props()

  let needsConfirmation = $state(false)

  let buttonIcon = $derived(!isDestructive ? icon : needsConfirmation ? confirmationIcon : icon)

  let classes = $derived(
    clsx({
      'hover:bg-background-critical-bold hover:text-foreground-inverse text-foreground-critical':
        isDestructive,
      'hover:bg-background-default-tertiary-hover text-foreground bg-background': !isDestructive,
      'opacity-30': disabled
    })
  )

  const handleClick = () => {
    if (isDestructive && !needsConfirmation) {
      needsConfirmation = true
      setTimeout(() => {
        needsConfirmation = false
      }, 3000)
      return
    }

    needsConfirmation = false

    onClick?.()
  }
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
