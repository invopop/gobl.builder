<script lang="ts">
  import { fly } from "svelte/transition";

  import type { Notification } from "./index.js";
  import Alert from "./Notification.svelte";

  export let notifications = new Set<Notification>();
</script>

<div class="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 mb-6">
  {#each [...notifications] as notification}
    <div in:fly={{ y: -20 }} out:fly={{ y: -20 }}>
      <Alert {...notification} />
    </div>
  {/each}
</div>
