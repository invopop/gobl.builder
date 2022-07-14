<script lang="ts">
  import Actions from "./Actions.svelte";
  import TemplatePicker from "./TemplatePicker.svelte";
  import logo from "../static/logo-dark.svg";
</script>

<div class="flex gap-4 items-center px-4 py-3.5">
  <img src={logo} class="w-8 h-8" alt="GOBL logo" title="GOBL Builder" />
  <TemplatePicker />
  <div class="flex-1 flex justify-end">
    <Actions />
  </div>
</div>
