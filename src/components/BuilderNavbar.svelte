<script lang="ts">
  import { onMount } from 'svelte'
  import { getSchemas } from '../lib/editor/actions'
  import DocLoader from '../components/DocLoader.svelte'
  import logo from '../static/logo-name.svg'
  import type { ListOption } from '../lib/types/ui'
  import type { State } from '../lib/types/editor'
  import SelectSchemas from '../lib/SelectSchemas.svelte'
  import BuilderNavbarOptions from './BuilderNavbarOptions.svelte'
  import BuilderNavbarActions from './BuilderNavbarActions.svelte'
  import BuilderNavbarSeparator from './BuilderNavbarSeparator.svelte'
  import { Icon } from '@steeze-ui/svelte-icon'
  import { Menu, Close } from '@invopop/ui-icons'
  import BuilderNavbarDownload from './BuilderNavbarDownload.svelte'
  import BuilderNavbarView from './BuilderNavbarView.svelte'
  import BuilderNavbarCorrect from './BuilderNavbarCorrect.svelte'
  import type { GOBLDocument } from '$lib/types/envelope'

  const GOBL_URL = 'https://gobl.org/draft-0/'

  interface Props {
    defaultSchema?: string
    forceReadOnly?: boolean
    initialState?: State
    envelope?: string
    editorView?: string
    onSchemaChanged?: (schema: string) => void
    onLoad?: (doc: GOBLDocument) => void
    onAction?: (action: string) => void
  }

  let {
    defaultSchema = $bindable(''),
    forceReadOnly = $bindable(false),
    initialState = 'init',
    envelope = '',
    editorView = $bindable('code'),
    onSchemaChanged,
    onLoad,
    onAction
  }: Props = $props()

  let mobileMenuOpen = $state(false)
  let schemasList: ListOption[] = []

  onMount(async () => {
    const schemas = await getSchemas()
    schemasList = schemas.map((s: string) => ({
      value: s,
      label: s.replace(GOBL_URL, '')
    }))

    schemasList.unshift({
      value: '',
      label: 'All'
    })
  })
</script>

<nav
  class="fixed w-full z-50 h-14 flex items-center justify-between bg-gobl-900 py-2 px-5 space-x-1"
  aria-label="main navigation"
>
  <div class="flex items-center">
    <a href="https://gobl.org">
      <img src={logo} class="h-6" alt="GOBL logo" title="GOBL Builder" />
    </a>

    <div class="hidden md:block mx-3">
      <BuilderNavbarSeparator />
    </div>

    <div class="hidden md:block">
      <DocLoader {onLoad} />
    </div>

    <div class="hidden md:block lg:w-[256px] ml-3">
      <SelectSchemas
        navBar
        bind:value={defaultSchema}
        placeholder="Schema"
        onChange={(value) => {
          onSchemaChanged?.(value)
        }}
      />
    </div>
  </div>

  <div class="hidden md:flex items-center space-x-3 text-white">
    <BuilderNavbarActions {initialState} {onAction} />

    <BuilderNavbarSeparator />
    <BuilderNavbarCorrect {initialState} {onAction} />
    <BuilderNavbarSeparator />

    <BuilderNavbarDownload
      {initialState}
      {envelope}
      {onAction}
      disabled={!['build', 'signed'].includes(initialState)}
    />
    <BuilderNavbarSeparator />
    <div class="flex items-center space-x-2">
      <BuilderNavbarOptions {initialState} bind:forceReadOnly />
      <BuilderNavbarView bind:editorView />
    </div>
  </div>
  <button
    class="md:hidden p-1.5 border border-gobl-300"
    onclick={() => {
      mobileMenuOpen = !mobileMenuOpen
    }}
  >
    {#if mobileMenuOpen}
      <Icon src={Close} class="w-5 h-5 text-white" />
    {:else}
      <Icon src={Menu} class="w-5 h-5 text-white" />
    {/if}
  </button>
</nav>
{#if mobileMenuOpen}
  <div class="absolute md:hidden mt-14 bg-gobl-900 inset-0 z-10 px-3 py-2">
    <div class="flex">
      <DocLoader
        onLoad={(doc) => {
          mobileMenuOpen = false
          onLoad?.(doc)
        }}
      />
      <div class="w-full ml-3">
        <SelectSchemas
          navBar
          bind:value={defaultSchema}
          placeholder="Schema"
          onChange={(value) => {
            onSchemaChanged?.(value)
          }}
        />
      </div>
    </div>
    <hr class="my-5 border-gobl-300" />
    <BuilderNavbarView bind:editorView />
    <hr class="my-5 border-gobl-300" />
    <BuilderNavbarOptions bind:forceReadOnly />
    <hr class="my-5 border-gobl-300" />
    <div class="flex items-center space-x-3">
      <BuilderNavbarActions
        {initialState}
        onAction={(action) => {
          mobileMenuOpen = false
          onAction?.(action)
        }}
      />
      <BuilderNavbarSeparator />
      <BuilderNavbarSeparator />
      <BuilderNavbarCorrect {initialState} {onAction} />
      <BuilderNavbarDownload
        {initialState}
        {envelope}
        {onAction}
        disabled={initialState !== 'built'}
      />
    </div>
  </div>
{/if}
