<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";

  export let field: UIModelField<string>;
</script>

<span class="cursor-not-allowed text-blue-500 h-8 py-1.5 pr-2">{field.value}</span>
