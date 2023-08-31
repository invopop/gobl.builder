<script lang="ts">
  import { EditorProblemSeverity, type EditorProblem } from "$lib/editor/EditorProblem.js";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import GOBLBuilder from "$lib/GOBLBuilder.svelte";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import DocLoader from "../components/DocLoader.svelte";
  import logo from "../static/logo-light.svg";

  interface GOBLDocument {
    $schema: string;
    [key: string]: unknown;
  }

  let data = "";
  let problems: EditorProblem[] = [];
  $: hasErrors = !!problems.find((problem) => problem.severity === EditorProblemSeverity.Error);
  $: console.log({ hasErrors });
  let jsonSchemaURL = "";
  let builder: GOBLBuilder;
  let errored = false;
  let signed = false;
  let modified = false;
  let built = false;

  function handleDocLoad(event: CustomEvent<GOBLDocument>) {
    data = JSON.stringify(event.detail, null, 4);
    // Ensure that future JSON Schemas match (currently disabled)
    //jsonSchemaURL = event.detail.$schema;
  }
</script>

<div class="flex flex-col h-screen">
  <div class="flex justify-between items-center pl-4 pr-2 py-2.5 bg-gray-800">
    <div class="flex gap-4">
      <img src={logo} class="w-8 h-8" alt="GOBL logo" title="GOBL Builder" />
      <DocLoader on:load={handleDocLoad} />
    </div>
    <div class="bg-slate-100 rounded">
      <Tooltip label={errored ? "To build, first ensure the document is valid." : "Build the GOBL document."}>
        <button
          class={iconButtonClasses(errored)}
          on:click={() => {
            builder.build();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </Tooltip>
      <Tooltip label="Sign document.">
        <button
          on:click={() => {
            builder.sign();
          }}
          class={iconButtonClasses(errored)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path
              fill-rule="evenodd"
              d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </Tooltip>
      <Tooltip label="Validate a signed GOBL document.">
        <button
          on:click={() => {
            builder.validate();
          }}
          class={iconButtonClasses(errored || !signed)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </Tooltip>
    </div>
  </div>
  <div class="flex-1 h-full overflow-hidden">
    <GOBLBuilder
      bind:this={builder}
      bind:built
      bind:modified
      bind:errored
      bind:signed
      bind:data
      bind:problems
      {jsonSchemaURL}
      signEnabled={true}
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
