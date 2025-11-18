<script lang="ts">
  import { Modal } from 'flowbite-svelte'
  import DocLoaderContent from './DocLoaderContent.svelte'
  import { Icon } from '@steeze-ui/svelte-icon'
  import { Folder } from '@invopop/ui-icons'
  import type { GOBLDocument } from '$lib/types/envelope'

  let openModal = $state(false)

  interface Props {
    onLoad?: (doc: GOBLDocument) => void
  }

  let { onLoad }: Props = $props()
</script>

<button
  title="Load a GOBL document from a template, file upload or your library."
  class="border border-white-70 py-[5px] pl-2 pr-3 text-white rounded text-sm font-medium flex items-center space-x-1"
  onclick={() => {
    openModal = true
  }}
>
  <Icon src={Folder} class="h-5 w-5" />
  <span>Load</span>
</button>
{#if openModal}
  <Modal
    class="backdrop:bg-neutral-80/80"
    bodyClass="px-6 pt-2"
    outsideclose
    dismissable={false}
    size="xs"
    bind:open={openModal}
    autoclose
  >
    {#snippet header()}
      <div>
        <p class="font-semibold text-xl text-neutral-80 dark:text-white px-2">Load Example</p>
      </div>
    {/snippet}
    <DocLoaderContent onClose={() => (openModal = false)} {onLoad} />
  </Modal>
{/if}
