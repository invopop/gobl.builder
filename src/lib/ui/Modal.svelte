<script lang="ts">
  import clickOutside from "$lib/clickOutside.js";

  export let title = "";
</script>

<!-- Main modal -->
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
      <div class="px-6 overflow-x-auto">
        <slot />
      </div>
      <div class="px-6 pb-6 pt-5 flex items-center justify-end">
        <slot name="footer" />
      </div>
    </div>
  </div>
</div>
