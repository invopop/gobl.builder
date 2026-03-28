<script lang="ts">
  import { AccordionItem, Accordion } from 'flowbite-svelte'
  import templateGroups from './templateData'
  import type { GOBLDocument } from '$lib/types/envelope'

  interface Props {
    onLoad?: (doc: GOBLDocument) => void
    onClose?: () => void
  }

  let { onLoad, onClose }: Props = $props()
  let search = $state('')

  let filtered = $derived(
    search.trim() === ''
      ? templateGroups
      : templateGroups.filter(
          (g) =>
            g.name.toLowerCase().includes(search.toLowerCase()) ||
            g.folder.toLowerCase().includes(search.toLowerCase()) ||
            g.templates.some((t) => t.name.toLowerCase().includes(search.toLowerCase()))
        )
  )

  async function handleTemplateClick(templatePath: string) {
    const doc = await fetch(templatePath)
    const data = await doc.json()

    onLoad?.(data)
    onClose?.()
  }
</script>

<!-- Search -->
<div class="px-3 pb-3">
  <div class="relative">
    <svg
      class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <input
      type="text"
      bind:value={search}
      placeholder="Filter by country or format..."
      class="w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-background-default-secondary dark:bg-neutral-800 text-foreground dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all"
    />
    {#if search}
      <button
        onclick={() => (search = '')}
        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        aria-label="Clear search"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    {/if}
  </div>
</div>

{#if filtered.length === 0}
  <p class="text-sm text-neutral-400 px-4 py-3">No matching templates found.</p>
{:else}
  <Accordion class="border-0">
    {#each filtered as group, i (i)}
      <AccordionItem
        open={search.trim() !== ''}
        headerClass="flex items-center justify-between w-full font-medium text-left border-neutral-20 rounded border-t mt-2 p-0 group-first:rounded-t"
        contentClass="pt-4 px-0 pb-0 border-neutral-20"
      >
        {#snippet header()}
          <div class="flex items-center space-x-2 w-full pl-[14px] py-[10px]">
            {#if group.flag}<span>{group.flag}</span>{/if}
            <span class="text-neutral-80 dark:text-white font-medium flex-1">{group.name}</span>
            <span class="text-xs text-neutral-400 pr-2">{group.templates.length}</span>
          </div>
        {/snippet}
        {#snippet arrowup()}
          <div class="pr-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-foreground dark:stroke-foreground-inverse"
            >
              <path d="M13.5 11.75L10 8.25L6.5 11.75" stroke-width="1.1" />
            </svg>
          </div>
        {/snippet}
        {#snippet arrowdown()}
          <div class="pr-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-foreground dark:stroke-foreground-inverse"
            >
              <path d="M6.5 8.25004L10 11.75L13.5 8.25" stroke-width="1.2" />
            </svg>
          </div>
        {/snippet}
        <ul class="px-1.5 pb-[10px]">
          {#each group.templates as template}
            <li class="">
              <button
                class="text-left w-full text-sm font-normal text-indigo-100 dark:text-white py-2 px-3 border rounded border-transparent hover:border-neutral-200 hover:bg-background-default-secondary"
                onclick={() => handleTemplateClick(`/templates/${group.folder}/${template.file}`)}
              >
                {template.name}
              </button>
            </li>
          {/each}
        </ul>
      </AccordionItem>
    {/each}
  </Accordion>
{/if}
