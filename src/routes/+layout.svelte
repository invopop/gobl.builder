<script lang="ts">
  import "../app.css";
  import { SvelteToast } from "@zerodevx/svelte-toast";
</script>

<svelte:head>
  <script defer data-domain="build.gobl.org" src="https://plausible.io/js/script.js"></script>
</svelte:head>

<slot />
<SvelteToast />

<style>
  :root {
    --toastContainerTop: auto;
    --toastContainerRight: auto;
    --toastContainerBottom: 2rem;
    --toastContainerLeft: calc(100vw - 18rem);
  }
</style>
