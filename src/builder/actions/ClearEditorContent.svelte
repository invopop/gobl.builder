<script lang="ts">
  export let onClose: () => void = undefined;
  export let onClearEditor: () => void = undefined;
</script>

<p class="mb-6">
  Are you sure you want to clear the editor? <span class="text-red-500">This action is irreversable.</span>
</p>
<div class="inline-flex gap-2">
  <button class="bg-gray-200 p-2 rounded-lg font-semibold" on:click={onClose}>Cancel</button>
  <button class="text-white bg-red-500 p-2 rounded-lg font-semibold" on:click={onClearEditor}>Clear editor</button>
</div>
