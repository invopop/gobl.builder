<script lang="ts">
  import { editor, envelope } from "$lib/stores.js";
  import MenuBar from "./menubar/MenuBar.svelte";
  import Editor from "./editor/Editor.svelte";

  export let jsonSchemaURL = "";
  export let data = "";

  // When `data` is updated, update the internal editor and envelope stores.
  // If `data` is JSON and it's a GOBL envelope, parse and store its contents
  // and the envelope separately.
  $: {
    try {
      const parsedValue = JSON.parse(data);
      if (parsedValue.$schema === "https://gobl.org/draft-0/envelope") {
        // Set new editor value *first*, because when the envelope is set, the Monaco
        // editor if the envelope contains signatures.
        $editor = JSON.stringify(parsedValue.doc, null, 4);
        $envelope = parsedValue;
      } else {
        $editor = JSON.stringify(parsedValue, null, 4);
        $envelope = null;
      }
    } catch (e) {
      $editor = data;
      $envelope = null;
    }
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
