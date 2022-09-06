<script lang="ts">
  import logo from "$lib/static/logo-dark.svg";

  import DocLoader from "$lib/actions/DocLoader.svelte";
  import ClearEditor from "$lib/actions/ClearEditor.svelte";
  import ExportDoc from "$lib/actions/ExportDoc.svelte";
  import Undo from "$lib/actions/Undo.svelte";
  import Redo from "$lib/actions/Redo.svelte";
  import Build from "$lib/actions/Build.svelte";
  import Validate from "$lib/actions/Validate.svelte";
  import Sign from "$lib/actions/Sign.svelte";
</script>

<div class="flex gap-4 items-center pl-4 pr-2 py-3 bg-slate-100">
  <img src={logo} class="w-8 h-8" alt="GOBL logo" title="GOBL Builder" />
  <DocLoader />
  <div class="flex-1 flex justify-end">
    <div class="border-r-2 pr-2 mr-2">
      <Undo />
      <Redo />
      <ClearEditor />
    </div>
    <div class="border-r-2 pr-2 mr-2">
      <Build />
      <Sign />
      <Validate />
    </div>
    <div>
      <ExportDoc />
    </div>
  </div>
</div>
