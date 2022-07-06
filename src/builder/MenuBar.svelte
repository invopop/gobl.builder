<script lang="ts">
  import Actions from "./Actions.svelte";
  import TemplatePicker from "./TemplatePicker.svelte";
  import logo from "../static/logo-dark.svg";
</script>

<div class="flex gap-2 items-center">
  <img src={logo} class="w-8 h-8" alt="GOBL logo" />
  <h1 class="w-32">GOBL Builder</h1>
  <TemplatePicker />
  <div class="flex-1 flex justify-end">
    <Actions />
  </div>
</div>
