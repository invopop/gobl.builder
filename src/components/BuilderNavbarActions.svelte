<script lang="ts">
  import { iconButtonClasses } from './iconButtonClasses'
  import type { State } from '../lib/types/editor'
  import { Icon } from '@steeze-ui/svelte-icon'
  import { Calculator, CrumpledPaper, Sign, SquareCheck } from '@invopop/ui-icons'

  interface Props {
    initialState?: State
    onAction?: (action: string) => void
  }

  let { initialState: state = 'init', onAction }: Props = $props()
</script>

<div class="flex space-x-2 items-center">
  <button
    title="Build the GOBL document."
    class="border border-gobl-50 py-[5px] pl-2 pr-3 text-gobl-50 rounded text-sm font-medium flex items-center space-x-1 disabled:text-white/30 disabled:border-gobl-300 disabled:cursor-not-allowed"
    disabled={state !== 'modified' && state !== 'loaded' && state !== 'errored'}
    onclick={() => {
      onAction?.('build')
    }}
  >
    <Icon src={Calculator} class="w-5 h-5" />
    <span>Build</span>
  </button>
  <button
    title="Sign document."
    onclick={() => {
      onAction?.('sign')
    }}
    class={iconButtonClasses}
    disabled={state !== 'built'}
  >
    <Icon src={Sign} class="w-5 h-5" />
  </button>
  <button
    title="Remove Signatures."
    class={iconButtonClasses}
    disabled={state !== 'signed'}
    onclick={() => {
      onAction?.('removeSigs')
    }}
  >
    <Icon src={CrumpledPaper} class="w-5 h-5" />
  </button>
  <button
    title="Validate a signed GOBL document."
    onclick={() => {
      onAction?.('validate')
    }}
    class={iconButtonClasses}
    disabled={state === 'errored' || state !== 'signed'}
  >
    <Icon src={SquareCheck} class="w-5 h-5" />
  </button>
</div>
