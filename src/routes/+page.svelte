<script lang="ts">
  import { EditorProblemSeverity, type EditorProblem } from "$lib/editor/EditorProblem.js";
  import GOBLBuilder from "$lib/GOBLBuilder.svelte";
  import DocLoader from "../components/DocLoader.svelte";
  import logo from "../static/logo-light.svg";

  const DEFAULT_JSON_SCHEMA_URL = "https://gobl.org/draft-0/bill/invoice";

  interface GOBLDocument {
    $schema: string;
    [key: string]: unknown;
  }

  let data = "";
  let problems: EditorProblem[] = [];
  $: hasErrors = !!problems.find((problem) => problem.severity === EditorProblemSeverity.Error);
  $: console.log({ hasErrors });
  let jsonSchemaURL = DEFAULT_JSON_SCHEMA_URL;

  function handleDocLoad(event: CustomEvent<GOBLDocument>) {
    data = JSON.stringify(event.detail, null, 4);
    jsonSchemaURL = event.detail.$schema;
  }
</script>

<div class="flex flex-col h-screen">
  <div class="flex-none flex gap-4 items-center pl-4 pr-2 py-2.5 bg-gray-800">
    <img src={logo} class="w-8 h-8" alt="GOBL logo" title="GOBL Builder" />
    <DocLoader on:load={handleDocLoad} />
  </div>
  <div class="flex-1 h-full overflow-hidden">
    <GOBLBuilder
      bind:data
      bind:problems
      {jsonSchemaURL}
      on:change={(event) => {
        console.log("Received change event.", event.detail);
      }}
      on:undo={() => {
        console.log("User clicked `Undo`.");
      }}
      on:redo={() => {
        console.log("User clicked `Redo`.");
      }}
      on:clear={() => {
        console.log("User cleared editor.");
      }}
      on:build={(event) => {
        console.log("Received build result.", event.detail);
      }}
      on:sign={(event) => {
        console.log("Received sign result.", event.detail);
      }}
      on:validate={(event) => {
        console.log("Received validate result.", event.detail);
      }}
      on:preview={(event) => {
        console.log("User attempted preview.", event.detail);
      }}
      on:download={(event) => {
        console.log("User attempted download.", event.detail);
      }}
    />
  </div>
</div>
