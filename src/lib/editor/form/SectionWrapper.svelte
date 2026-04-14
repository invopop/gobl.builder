<script lang="ts">
  import { intersect } from 'svelte-intersection-observer-action'
  import FieldTitle from './FieldTitle.svelte'
  import FieldError from './FieldError.svelte'
  import ExpandButton from '$lib/ui/ExpandButton.svelte'
  import { slide } from 'svelte/transition'
  import clsx from 'clsx'
  import { getContext } from 'svelte'
  import { getBuilderContext } from '$lib/store/builder'
  import type { Schema } from './utils/schema'
  import type { SectionWrapperProps } from '$lib/types/editor'
  import { canonicalPathKey, fieldPathSegments } from './utils/faultPaths'

  const { envelopeIsSigned, faultsByPath } = getBuilderContext()

  const editorId = getContext('editorId')

  const { activeSection, activeItem, scrollingSection } = getBuilderContext()

  function callback(entry: IntersectionObserverEntry) {
    // If we are navigating from outside
    if ($scrollingSection) return

    // We only care about intersecting in and off ocurring on the top side
    if (entry.boundingClientRect.top > 300) return

    $activeSection = {
      section: field.id,
      scroll: false
    }
  }
  const intersectOptions = { callback, root: document.querySelector(`#${editorId}`) }

  let { field, readOnly, children, extraContent }: SectionWrapperProps = $props()

  let ownPathKey = $derived(canonicalPathKey(fieldPathSegments(field)))
  let containerErrors = $derived($faultsByPath.get(ownPathKey) ?? [])

  let element: HTMLElement
  let open = $state(true)

  let childrenType = $derived((field.schema.items as Schema)?.type)
  let label = $derived(
    $envelopeIsSigned
      ? 'Document is signed and can not be edited'
      : `${field.schema.description || ''}${field.is.calculated ? ' (calculated)' : ''}`
  )
  let isParent = $derived(['object', 'array'].includes(field.type) && childrenType !== 'string')
  let isSection = $derived(field.is.root || (isParent && field.parent?.is.root))
  let isActive = $derived(field.id === $activeItem)
  let wrapperClasses = $derived(
    clsx({
      'rounded-r': readOnly,
      'rounded-l': isSection
    })
  )

  $effect(() => {
    if (!$activeSection.scroll) return
    scrollElementIntoView()
  })

  function scrollElementIntoView() {
    $scrollingSection = true

    setTimeout(() => {
      $scrollingSection = false
    }, 1000)

    if (!element || $activeSection.section !== field.id) return

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  function handleFocusInner() {
    open = true
  }
</script>

<div bind:this={element} id={field.id} title={label} class={wrapperClasses}>
  {#if isSection}
    <div use:intersect={intersectOptions}></div>
  {/if}
  {#if isParent}
    <div class="py-2 pl-3 pr-2">
      <button
        class="flex items-center justify-start cursor-pointer"
        onclick={() => {
          open = !open
        }}
      >
        <FieldTitle {field} />
        <ExpandButton {open} />
      </button>
      {#if containerErrors.length > 0}
        <div class="mt-1 flex flex-col space-y-1">
          {#each containerErrors as message (message)}
            <FieldError error={message} />
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  {#if open}
    <div transition:slide class:overflow-hidden={!open} onfocusincapture={handleFocusInner}>
      <div class:pb-1={isParent} class="grid grid-cols-1 w-full">
        {@render children?.()}
      </div>
    </div>
  {/if}
  {#if isSection}
    <div use:intersect={intersectOptions}></div>
  {/if}
</div>
{@render extraContent?.()}
