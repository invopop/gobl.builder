<script lang="ts">
  import { status } from "./stores";
  import Alert from "../ui/Alert.svelte";
</script>

{#if $status}
  <Alert {...$status} />
{/if}
