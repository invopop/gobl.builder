<script lang="ts">
  import { EditorProblemSeverity, type EditorProblem } from "$lib/editor/EditorProblem.js";
  import { iconButtonClasses } from "$lib/ui/iconButtonClasses.js";
  import GOBLBuilder from "$lib/GOBLBuilder.svelte";
  import DocLoader from "../components/DocLoader.svelte";
  import logo from "../static/logo-light.svg";
  import type { State } from "$lib/types/editor";
  import SelectSchemas from "$lib/SelectSchemas.svelte";
  import ExportDoc from "$lib/actions/ExportDoc.svelte";
  import CorrectIcon from "$lib/ui/icons/CorrectIcon.svelte";

  interface GOBLDocument {
    $schema: string;
    [key: string]: unknown;
  }

  let data = "";
  let problems: EditorProblem[] = [];
  $: hasErrors = !!problems.find((problem) => problem.severity === EditorProblemSeverity.Error);
  $: console.log({ hasErrors });
  let jsonSchemaURL = "";
  let defaultSchema = "";
  let builder: GOBLBuilder;
  let state: State = "init";

  function handleDocLoad(event: CustomEvent<GOBLDocument>) {
    const newData = JSON.stringify(event.detail, null, 4);
    data = newData;

    // Hack for allowing load the same document again to restore data
    if (newData === data) {
      builder.reloadData();
    }

    jsonSchemaURL = event.detail.$schema;
    defaultSchema = jsonSchemaURL.replace("https://gobl.org/draft-0/", "");
  }

  function handleSchemaChange(event: CustomEvent<string>) {
    jsonSchemaURL = event.detail;
  }
</script>

<div class="flex flex-col h-screen">
  <div class="flex justify-between items-center pl-4 pr-2 py-2.5 bg-gray-800">
    <div class="flex gap-4 items-center">
      <img src={logo} class="w-8 h-8" alt="GOBL logo" title="GOBL Builder" />
      <DocLoader on:load={handleDocLoad} />
      <div
        class="w-64 flex text-sm items-center justify-center"
        style="--height: 28px; --chevron-height: 28px; --font-size: 14px;"
      >
        <SelectSchemas
          placeholder="Select required schema..."
          allowAll
          value={defaultSchema}
          on:change={handleSchemaChange}
        />
      </div>
    </div>

    <div class="bg-slate-100 rounded flex space-x-3 items-center justify-center">
      <button
        title={state === "modified" || state === "loaded"
          ? "Build the GOBL document."
          : "To build, first ensure the document is valid."}
        class={iconButtonClasses(state !== "modified" && state !== "loaded")}
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
      <button
        title="Correct document."
        on:click={() => {
          builder.correct();
        }}
        class={iconButtonClasses(!["built", "loaded", "signed"].includes(state))}
      >
        <CorrectIcon />
      </button>
      <button
        title="Sign document."
        on:click={() => {
          builder.sign();
        }}
        class={iconButtonClasses(state !== "built")}
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
      <button
        title="Validate a signed GOBL document."
        on:click={() => {
          builder.validate();
        }}
        class={iconButtonClasses(state === "errored" || state !== "signed")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      <ExportDoc
        on:preview={(event) => {
          console.log("User attempted preview.", event.detail);
        }}
        on:download={(event) => {
          console.log("User attempted download.", event.detail);
        }}
      />
      <div class="flex text-gray-700 space-x-2 items-center justify-center pr-4 w-20 text-right">
        <span class="text-xs">{state}</span>
      </div>
    </div>
  </div>
  <div class="flex-1 h-full overflow-hidden">
    <GOBLBuilder
      bind:this={builder}
      bind:state
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
      on:build={(event) => {
        console.log("Received build result.", event.detail);
      }}
      on:sign={(event) => {
        console.log("Received sign result.", event.detail);
      }}
      on:validate={(event) => {
        console.log("Received validate result.", event.detail);
      }}
    />
  </div>
</div>
