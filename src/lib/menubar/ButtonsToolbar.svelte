<script lang="ts">
  import Undo from "$lib/actions/Undo.svelte";
  import Redo from "$lib/actions/Redo.svelte";
  import Build from "$lib/actions/Build.svelte";
  import ActionsButton from "./ActionsButton.svelte";

  export let jsonSchemaURL: string;
  export let signEnabled: boolean;
</script>

<div class="flex items-center justify-end py-1 text-xs font-medium">
  <div class="flex items-center border-r-2 h-6 pr-4 mr-4">
    <div class="flex items-center">
      <Undo on:undo />
      <Redo on:redo />
    </div>
  </div>
  <div class="flex items-center border-r-2 h-6 pr-4 mr-4 relative">
    <ActionsButton {jsonSchemaURL} {signEnabled} />
  </div>
  <div class="flex items-center h-6 py-0.5">
    <Build {jsonSchemaURL} on:build />
  </div>
</div>
