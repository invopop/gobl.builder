<script lang="ts">
  import "./app.css";
  import MenuBar from "./builder/MenuBar.svelte";
  import Editor from "./builder/Editor.svelte";
</script>

<div class="flex flex-col h-full">
  <header class="flex-none pt-4 pl-4 pr-4 mb-4">
    <MenuBar />
  </header>
  <main class="flex-1 overflow-hidden">
    <Editor />
  </main>
</div>
