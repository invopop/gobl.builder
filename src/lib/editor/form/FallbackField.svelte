<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";

  interface Props {
    field: UIModelField;
  }

  let { field }: Props = $props();
</script>

<div class="bg-red-100">
  <span class="mr-1 font-bold capitalize">{field.key}:</span>
  <span>{field.type} (todo)</span>
</div>
