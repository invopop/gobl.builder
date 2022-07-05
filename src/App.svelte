<script lang="ts">
  import Editor from "./builder/Editor.svelte";
  import Actions from "./builder/Actions.svelte";

  import "./app.css";
  import StatusBar from "./builder/StatusBar.svelte";
  import TemplatePicker from "./builder/TemplatePicker.svelte";
</script>

<div class="flex flex-col h-full">
  <div class="flex-none pt-4 pl-4 mb-4">
    <div class="flex gap-2">
      <Actions />
      <TemplatePicker />
    </div>
  </div>
  <div class="flex-none px-4">
    <StatusBar />
  </div>
  <div class="flex-1 overflow-hidden">
    <Editor />
  </div>
</div>
