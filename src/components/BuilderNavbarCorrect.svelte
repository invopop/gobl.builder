<script lang="ts">
  import type { State } from '../lib/types/editor'
  import { Icon } from 'svelte-hero-icons'
  import { Erase } from '@invopop/ui-icons'
  import { iconButtonClasses } from './iconButtonClasses'

  interface Props {
    initialState?: State
    onAction?: (action: string) => void
  }

  let { initialState: state = 'init', onAction }: Props = $props()
</script>

<button
  title="Correct document."
  onclick={() => {
    onAction?.('correct')
  }}
  class={iconButtonClasses}
  disabled={!['loaded', 'built', 'signed'].includes(state)}
>
  <Icon src={Erase} class="w-5 h-5" />
</button>
