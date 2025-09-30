<script lang="ts">
  import type { FallbackFieldProps } from '$lib/types/editor'

  let { field }: FallbackFieldProps = $props()
</script>

<div class="bg-red-100">
  <span class="mr-1 font-bold capitalize">{field.key}:</span>
  <span>{field.type} (todo)</span>
</div>
