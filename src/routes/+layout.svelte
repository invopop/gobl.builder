<script lang="ts">
  import "inter-ui/inter.css";
  import "../app.css";
  import { ToastContainer } from "svelte-toasts";
  import { Icon } from "svelte-hero-icons";
  import { Failure, Info, Success } from "@invopop/ui-icons";
</script>

<svelte:head>
  <script defer data-domain="build.gobl.org" src="https://plausible.io/js/script.js"></script>
</svelte:head>

<slot />

<ToastContainer let:data placement="bottom-right" width="336px" duration={3000}>
  <div class="bg-neutral-800/80 rounded-md w-full">
    <div class="py-2 px-3 flex items-center space-x-2">
      <div class="flex-nowrap">
        {#if data.type === "success"}
          <Icon src={Success} class="w-4 h-4" />
        {:else if data.type === "error"}
          <Icon src={Failure} class="w-4 h-4" />
        {:else if data.type === "info"}
          <Icon src={Info} class="w-4 h-4 text-white/70" />
        {/if}
      </div>
      <p class="text-white font-medium text-base">{data.description}</p>
    </div>
  </div>
</ToastContainer>
