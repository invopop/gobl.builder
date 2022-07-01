<script lang="ts">
  import Editor from "./builder/Editor.svelte";
  import Actions from "./builder/Actions.svelte";

  import "./app.css";
  import StatusBar from "./builder/StatusBar.svelte";
</script>

<div class="flex flex-col h-screen">
  <div class="item pt-4 pl-4 mb-4">
    <Actions />
  </div>
  <div class="item px-4">
    <StatusBar />
  </div>
  <div class="item flex-auto">
    <Editor />
  </div>
</div>
