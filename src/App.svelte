<script lang="ts">
  import "./app.css";
  import MenuBar from "./builder/MenuBar.svelte";
  import Editor from "./builder/Editor.svelte";
  import StatusBar from "./builder/StatusBar.svelte";
</script>

<div class="flex flex-col h-full">
  <header class="flex-none pt-4 pl-4 pr-4 mb-4">
    <MenuBar />
  </header>
  <aside class="flex-none px-4">
    <StatusBar />
  </aside>
  <main class="flex-1 overflow-hidden">
    <Editor />
  </main>
</div>
