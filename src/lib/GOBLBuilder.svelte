<script lang="ts">
  import MenuBar from "./ui/MenuBar.svelte";
  import Toolbar from "./toolbar/Toolbar.svelte";
  import Editor from "./editor/Editor.svelte";
</script>

<div class="flex flex-col h-screen">
  <div class="flex-none">
    <MenuBar />
    <Toolbar />
  </div>
  <div class="flex-1 overflow-hidden">
    <Editor />
  </div>
</div>

<style>
  @import "@fontsource/fira-code";
</style>
