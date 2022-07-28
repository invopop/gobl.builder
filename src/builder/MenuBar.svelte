<script lang="ts">
  import logo from "../static/logo-dark.svg";

  import DocLoader from "./actions/DocLoader.svelte";
  import ClearEditor from "./actions/ClearEditor.svelte";
  import ExportDoc from "./actions/ExportDoc.svelte";
  import Build from "./actions/Build.svelte";
</script>

<div class="flex gap-4 items-center px-4 py-3.5 h-14">
  <img src={logo} class="w-8 h-8" alt="GOBL logo" title="GOBL Builder" />
  <DocLoader />
  <div class="flex-1 flex justify-end">
    <ClearEditor />
    <ExportDoc />
    <Build />
  </div>
</div>
