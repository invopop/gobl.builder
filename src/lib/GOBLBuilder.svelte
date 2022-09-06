<script lang="ts">
  import MenuBar from "./ui/MenuBar.svelte";
  import Toolbar from "./toolbar/Toolbar.svelte";
  import Editor from "./editor/Editor.svelte";

  export let jsonSchemaURL: string;
</script>

<div class="flex flex-col h-full">
  <div class="flex-none">
    <MenuBar {jsonSchemaURL} />
    <Toolbar />
  </div>
  <div class="flex-1 overflow-hidden">
    <Editor {jsonSchemaURL} />
  </div>
</div>

<style>
  @import "@fontsource/fira-code";
</style>
