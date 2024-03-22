<script lang="ts">
  import clickOutside from "$lib/clickOutside.js";
  import { createEventDispatcher } from "svelte";
  import BaseButton from "./BaseButton.svelte";
  import type { IconSource } from "@steeze-ui/svelte-icon";

  const dispatch = createEventDispatcher();

  export let title = "";
  export let confirmButtonIcon: IconSource | undefined = undefined;
  export let confirmButtonText = "Confirm";
  export let hideConfirmButton = false;
</script>

<!-- Main modal -->
<div>
  <div class="editor-modal fixed inset-0 z-40" />
  <div
    tabindex="-1"
    class="fixed top-0 left-0 right-0 z-50 w-full overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full justify-center items-center flex"
  >
    <div class="relative w-full lg:w-[800px] h-full p-4 md:h-auto">
      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow overflow-auto" use:clickOutside on:close>
        <!-- Modal header -->
        <div class="flex items-center justify-between p-6 rounded-lg">
          <h3 class="text-3xl font-semibold text-gray-800">{title}</h3>
        </div>
        <!-- Modal body -->
        <div class="overflow-x-auto">
          <slot />
        </div>
        <div class="px-6 pb-6 pt-5 flex items-center justify-end space-x-3">
          <slot name="footer">
            <BaseButton
              on:click={() => {
                dispatch("close");
              }}
            >
              Cancel
            </BaseButton>
            {#if !hideConfirmButton}
              <BaseButton icon={confirmButtonIcon} variant="primary" on:click={() => dispatch("confirm")}>
                {confirmButtonText}
              </BaseButton>
            {/if}
          </slot>
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
