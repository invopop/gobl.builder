<script lang="ts">
  import type { FieldErrorProps } from '$lib/types/editor'
  import { ExclamationCircle, Icon } from 'svelte-hero-icons'

  let { error = '' }: FieldErrorProps = $props()
</script>

<span class="text-foreground-critical text-sm flex space-x-1 items-start">
  <Icon src={ExclamationCircle} solid class="h-4 w-4 text-foreground-critical" />
  <span>{error}</span>
</span>
