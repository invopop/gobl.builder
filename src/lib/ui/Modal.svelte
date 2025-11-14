<script lang="ts">
  import clickOutside from '$lib/clickOutside.js'
  import type { ModalProps } from '$lib/types/editor'
  import { BaseButton } from '@invopop/popui'

  let {
    title = '',
    confirmButtonIcon = undefined,
    confirmButtonText = 'Confirm',
    hideConfirmButton = false,
    children,
    footer,
    onclose,
    onConfirm
  }: ModalProps = $props()
</script>

<!-- Main modal -->
<div>
  <div class="editor-modal fixed inset-0 z-40"></div>
  <div
    tabindex="-1"
    class="fixed top-0 left-0 right-0 z-50 w-full overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full justify-center items-center flex"
  >
    <div class="relative w-full lg:w-[800px] h-full p-4 md:h-auto">
      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow overflow-auto" use:clickOutside {onclose}>
        <!-- Modal header -->
        <div class="flex items-center justify-between p-12 rounded-lg">
          <h3 class="text-3xl font-semibold text-gray-800">{title}</h3>
        </div>
        <!-- Modal body -->
        <div class="overflow-x-auto">
          {@render children?.()}
        </div>
        <div class="px-6 pb-6 pt-5 flex items-center justify-end space-x-3">
          {#if footer}{@render footer()}{:else}
            <BaseButton
              variant="secondary"
              onclick={() => {
                onclose?.()
              }}
            >
              Cancel
            </BaseButton>
            {#if !hideConfirmButton}
              <BaseButton icon={confirmButtonIcon} variant="primary" onclick={() => onConfirm?.()}>
                {confirmButtonText}
              </BaseButton>
            {/if}
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .editor-modal {
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(20px);
  }
</style>
