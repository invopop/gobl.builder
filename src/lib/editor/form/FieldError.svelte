<script lang="ts">
  import type { FieldErrorProps } from '$lib/types/editor'
  import { ExclamationCircle, Icon } from 'svelte-hero-icons'

  let { error = '' }: FieldErrorProps = $props()
</script>

<span class="text-danger-500 text-sm whitespace-nowrap flex space-x-1 items-center h-[18px]">
  <Icon src={ExclamationCircle} solid class="h-4 w-4 text-danger-500" />
  <span>{error}</span>
</span>
