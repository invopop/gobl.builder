<script lang="ts">
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import type { UIModelField } from "./utils/model.js";

  export let field: UIModelField | undefined = undefined;
  export let showAdd = true;
  export let showOptions = true;

  const dispatch = createEventDispatcher();

  function handleClickAddButton(e: MouseEvent) {
    e.ctrlKey;
    dispatch("add", e.ctrlKey || e.altKey || e.metaKey || e.shiftKey);
  }

  function handleClickOptionsButton() {
    dispatch("options");
  }

  $: clasess = field?.is.calculated ? "bg-blue-100" : "bg-gray-200";
</script>

<div
  class="absolute flex w-full h-full top-0 right-0 z-0 rounded rounded-tl-none rounded-bl-none {clasess}"
  transition:fade={{ duration: 200 }}
>
  <div class="flex-shrink-0 absolute right-full top-0 rounded rounded-tr-none rounded-br-none {clasess}">
    <div class="flex align-middle text-gray-500">
      {#if showAdd}
        <Tooltip>
          <svelte:fragment slot="content">
            <p class="font-bold  whitespace-nowrap">Add field</p>
            <p class="whitespace-nowrap text-xs">(Option + Click to add above)</p>
          </svelte:fragment>
          <button on:click={handleClickAddButton} class="p-2.5 h-12 pr-0.5 border border-transparent">
            <svg viewBox="0 0 16 16" class="h-6 w-6 p-1 hover:bg-gray-100 rounded">
              <path
                fill="currentColor"
                d="M7.977 14.963c.407 0 .747-.324.747-.723V8.72h5.362c.399 0 .74-.34.74-.747a.746.746 0 00-.74-.738H8.724V1.706c0-.398-.34-.722-.747-.722a.732.732 0 00-.739.722v5.529h-5.37a.746.746 0 00-.74.738c0 .407.341.747.74.747h5.37v5.52c0 .399.332.723.739.723z"
              />
            </svg>
          </button>
        </Tooltip>
      {/if}
      {#if showOptions}
        <Tooltip>
          <svelte:fragment slot="content">
            <p class="font-bold whitespace-nowrap">Options</p>
            <p class="whitespace-nowrap text-xs">(Drag to sort items)</p>
          </svelte:fragment>
          <button on:click={handleClickOptionsButton} class="p-2.5 h-12 pl-0.5 border border-transparent">
            <svg viewBox="0 0 10 10" class="h-6 w-6 p-1 hover:bg-gray-100 rounded">
              <path
                fill="currentColor"
                d="M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z"
              />
            </svg>
          </button>
        </Tooltip>
      {/if}
    </div>
  </div>
</div>
