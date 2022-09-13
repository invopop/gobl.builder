<script lang="ts">
  import { editor, envelope } from "$lib/stores.js";
  import MenuBar from "./menubar/MenuBar.svelte";
  import Editor from "./editor/Editor.svelte";

  export let jsonSchemaURL: string;
  export let value: string;

  // When `value` is updated, update the internal editor and envelope stores.
  $: {
    $editor = value;
    $envelope = null;
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex-none">
    <MenuBar {jsonSchemaURL} />
  </div>
  <div class="flex-1 overflow-hidden">
    <Editor {jsonSchemaURL} />
  </div>
</div>

<style>
  @import "@fontsource/fira-code";
</style>
