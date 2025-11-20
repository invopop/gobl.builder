<script lang="ts">
  import { Block, Code } from '@invopop/ui-icons'
  import { Icon } from '@steeze-ui/svelte-icon'

  interface Props {
    editorView?: string
  }

  let { editorView = $bindable('code') }: Props = $props()
</script>

<div class="inline-flex text-white space-x-1 p-0.5 rounded border border-sky-40">
  <button
    title="Form view"
    class:bg-sky-70={editorView === 'form'}
    class="rounded p-1"
    onclick={() => {
      editorView = 'form'
    }}
  >
    <Icon src={Block} class="h-5 w-5 text-sky-40" />
  </button>
  <button
    title="Developer Mode"
    class:bg-sky-70={editorView === 'code'}
    class="rounded p-1"
    onclick={() => {
      editorView = 'code'
    }}
  >
    <Icon src={Code} class="h-5 w-5 text-sky-40" />
  </button>
</div>
