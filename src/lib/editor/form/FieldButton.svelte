<script lang="ts">
  import type { FieldButtonProps } from '$lib/types/editor'
  import clsx from 'clsx'
  import { Icon } from '@steeze-ui/svelte-icon'

  let {
    icon,
    confirmationIcon = null,
    tooltipText = '',
    isDestructive = false,
    disabled = false,
    onClick
  }: FieldButtonProps = $props()

  let needsConfirmation = $state(false)

  let buttonIcon = $derived(!isDestructive ? icon : needsConfirmation ? (confirmationIcon ?? icon) : icon)

  let classes = $derived(
    clsx({
      'hover:bg-background-critical-bold hover:text-foreground-inverse text-foreground-critical':
        isDestructive,
      'bg-background-critical border border-border-critical-bold':
        isDestructive && needsConfirmation,
      'border border-border hover:bg-background-default-tertiary-hover text-foreground': !isDestructive,
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
  class="{classes} flex items-center justify-center h-6 rounded whitespace-nowrap"
  class:w-6={!isDestructive || !needsConfirmation}
  class:px-[4px]={isDestructive && needsConfirmation}
  class:flex-row-reverse={isDestructive}
>
  <Icon src={buttonIcon} class="h-4 w-4" theme="outline" />
  {#if isDestructive && needsConfirmation}
    <span class="text-sm mr-1">Sure?</span>
  {/if}
</button>
