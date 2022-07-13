<script lang="ts">
  import "./app.css";
  import MenuBar from "./builder/MenuBar.svelte";
  import Toolbar from "./builder/Toolbar.svelte";
  import Editor from "./builder/Editor.svelte";
</script>

<div class="flex flex-col h-full">
  <header class="flex-none">
    <MenuBar />
    <Toolbar />
  </header>
  <main class="flex-1 overflow-hidden">
    <Editor />
  </main>
</div>
