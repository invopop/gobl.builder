<script lang="ts">
  import { Edit, Preview } from '@invopop/ui-icons'
  import { Icon } from '@steeze-ui/svelte-icon'
  import type { State } from '../lib/types/editor'

  interface Props {
    forceReadOnly?: boolean
    initialState?: State
  }

  let { forceReadOnly = $bindable(false), initialState: state = 'init' }: Props = $props()
</script>

<div class="inline-flex text-white space-x-1 p-0.5 rounded border border-sky-40">
  <button
    disabled={state === 'signed'}
    title="Edit"
    class:enabled:bg-sky-70={!forceReadOnly}
    class="rounded p-1 disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:text-gobl-50"
    onclick={() => {
      forceReadOnly = false
    }}
  >
    <Icon src={Edit} class="h-5 w-5 text-sky-40" />
  </button>
  <button
    title="Read Only"
    class:bg-sky-70={forceReadOnly || state === 'signed'}
    class="rounded p-1 disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:text-gobl-50"
    onclick={() => {
      forceReadOnly = true
    }}
  >
    <Icon src={Preview} class="h-5 w-5 text-sky-40" />
  </button>
</div>
