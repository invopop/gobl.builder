<script lang="ts">
  import type { UIModelField } from "$lib/schema.js";

  export let field: UIModelField;
</script>

<div class="flex gap-2">
  <span class="mr-1 font-bold capitalize">{field.title}:</span>
  <span contenteditable bind:innerHTML={field.value}>{field.value}</span>
</div>
