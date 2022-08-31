<script lang="ts">
  import { createEventDispatcher, SvelteComponent } from "svelte";
  import clickOutside from "$lib/clickOutside.js";

  const dispatch = createEventDispatcher();

  export let title = "Title";
  export let content: typeof SvelteComponent;
  export let contentProps: Record<string, unknown> = {};
</script>

<!-- Main modal -->
<div
  tabindex="-1"
  class="fixed top-0 left-0 right-0 z-50 w-full overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full justify-center items-center flex"
>
  <div class="relative w-full lg:w-3/5 h-full p-4 md:h-auto">
    <!-- Modal content -->
    <div class="relative bg-white rounded-lg shadow overflow-auto" use:clickOutside on:close>
      <!-- Modal header -->
      <div class="flex items-center justify-between p-6 border-b rounded-">
        <h3 class="text-xl font-semibold text-gray-900">{title}</h3>
        <button
          type="button"
          class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          on:click={() => dispatch("close")}
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg
          >
        </button>
      </div>
      <!-- Modal body -->
      <div class="p-6 text-sm overflow-x-auto">
        <svelte:component this={content} on:close {...contentProps} />
      </div>
    </div>
  </div>
</div>
