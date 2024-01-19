<script lang="ts">
  export let forceReadOnly = false;
</script>

<button
  class="inline-flex items-center space-x-1.5 p-1.5 border border-neutral-300"
  on:click={() => {
    forceReadOnly = !forceReadOnly;
  }}
>
  <input
    bind:checked={forceReadOnly}
    id="readonly"
    name="readonly"
    type="checkbox"
    class="form-checkbox bg-transparent h-5 w-5 rounded border-neutral-300 text-cyan-500 focus:ring-0 focus:ring-offset-0"
  />
  <label for="autobuild" class="text-sm text-neutral-100 whitespace-nowrap cursor-pointer">Read only</label>
</button>
