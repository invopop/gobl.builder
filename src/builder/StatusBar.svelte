<script lang="ts">
  import { status } from "./stores";
  import Alert from "../ui/Alert.svelte";
</script>

{#if $status}
  <div class="mb-4">
    <Alert {...$status} />
  </div>
{/if}
