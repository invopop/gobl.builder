<script lang="ts">
  import { getChangeViewHandler } from "./utils/tab.js";

  export let error: Error | string | undefined;

  const handleViewForm = getChangeViewHandler("code");
</script>

<div
  on:click={handleViewForm}
  class="border border-rose-600 bg-rose-50 hover:bg-rose-100 text-gray-600 p-3 rounded-md cursor-pointer"
>
  <p>There seems to be an error in your code. Please review and fix it to continue editing in the Visual editor.</p>
  {#if error}<p class="mt-1 font-bold">{error}</p>{/if}
</div>
