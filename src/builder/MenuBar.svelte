<script lang="ts">
  import Actions from "./Actions.svelte";
  import DocLoader from "./DocLoader.svelte";
  import logo from "../static/logo-dark.svg";
</script>

<div class="flex gap-4 items-center px-4 py-3.5 h-14">
  <img src={logo} class="w-8 h-8" alt="GOBL logo" title="GOBL Builder" />
  <DocLoader />
  <div class="flex-1 flex justify-end">
    <Actions />
  </div>
</div>
