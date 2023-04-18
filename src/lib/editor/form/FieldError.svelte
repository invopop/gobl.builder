<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  export let field: UIModelField<unknown>;
</script>

<span class="text-rose-500 text-xs whitespace-nowrap">
  {field.error}
</span>
