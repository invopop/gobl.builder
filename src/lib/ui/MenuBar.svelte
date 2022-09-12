<script lang="ts">
  import ClearEditor from "$lib/actions/ClearEditor.svelte";
  import ExportDoc from "$lib/actions/ExportDoc.svelte";
  import Undo from "$lib/actions/Undo.svelte";
  import Redo from "$lib/actions/Redo.svelte";
  import Build from "$lib/actions/Build.svelte";
  import Validate from "$lib/actions/Validate.svelte";
  import Sign from "$lib/actions/Sign.svelte";

  export let jsonSchemaURL: string;
</script>

<div class="flex gap-4 items-center pl-4 pr-2 py-2 bg-slate-100">
  <div class="flex-1 flex justify-end">
    <div class="border-r-2 pr-2 mr-2">
      <Undo />
      <Redo />
      <ClearEditor />
    </div>
    <div class="border-r-2 pr-2 mr-2">
      <Build {jsonSchemaURL} />
      <Sign {jsonSchemaURL} />
      <Validate {jsonSchemaURL} />
    </div>
    <div>
      <ExportDoc />
    </div>
  </div>
</div>
