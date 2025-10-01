<script lang="ts">
  import { Icon } from '@steeze-ui/svelte-icon'
  import { iconButtonClasses } from './iconButtonClasses'
  import { Invoice, Download, Header, Signature } from '@invopop/ui-icons'
  import LoadingIcon from '../lib/ui/LoadingIcon.svelte'
  import { toast } from 'svelte-sonner'
  import type { State } from '../lib/types/editor'

  const pdfApiBaseUrl = 'https://pdf.invopop.com'

  let generatingPDF = $state(false)

  interface Props {
    disabled?: boolean
    initialState?: State
    envelope?: string
    onAction?: (action: string) => void
  }

  let { disabled = false, initialState = 'init', envelope = '', onAction }: Props = $props()

  async function previewPDF() {
    const formData = new FormData()
    formData.append('envelope', new Blob([envelope]))

    generatingPDF = true

    try {
      const res = await fetch(`${pdfApiBaseUrl}/api`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const message = 'The PDF service returned an error:'
        const context = `${await res.text()} (HTTP status: ${res.status})`
        toast.error(`${message} ${context}`)
        return
      }

      const data = await res.blob()
      const url = URL.createObjectURL(data)
      window.open(url)
    } catch (e) {
      toast.error(`Failed to fetch PDF: ${e as string}`)
    } finally {
      generatingPDF = false
    }
  }
</script>

<div class="flex items-center space-x-2">
  <button
    title="Show document headers"
    class={iconButtonClasses}
    onclick={() => {
      onAction?.('showHeaders')
    }}
  >
    <Icon src={Header} class="h-5 w-5" />
  </button>
  <button
    title="Show document signatures"
    class={iconButtonClasses}
    disabled={initialState !== 'signed'}
    onclick={() => {
      onAction?.('showSignatures')
    }}
  >
    <Icon src={Signature} class="h-5 w-5" />
  </button>

  <button title="Preview document as PDF" onclick={previewPDF} class={iconButtonClasses} {disabled}>
    {#if generatingPDF}
      <LoadingIcon />
    {:else}
      <Icon src={Invoice} class="w-5 h-5" />
    {/if}
  </button>

  <button
    title="Preview and download document"
    onclick={() => {
      onAction?.('download')
    }}
    class={iconButtonClasses}
    {disabled}
  >
    <Icon src={Download} class="w-5 h-5" />
  </button>
</div>
