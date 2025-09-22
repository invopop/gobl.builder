<script lang="ts">
  import { ExclamationCircle, Icon } from "svelte-hero-icons";

  interface Props {
    error?: string;
  }

  let { error = "" }: Props = $props();
</script>

<span class="text-danger-500 text-sm whitespace-nowrap flex space-x-1 items-center h-[18px]">
  <Icon src={ExclamationCircle} solid class="h-4 w-4 text-danger-500" />
  <span>{error}</span>
</span>
