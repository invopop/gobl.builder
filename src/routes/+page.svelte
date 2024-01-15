<script lang="ts">
  import type { EditorProblem } from "$lib/editor/EditorProblem.js";
  import GOBLBuilder from "$lib/GOBLBuilder.svelte";
  import type { State } from "$lib/types/editor";
  import BuilderNavbar from "$lib/BuilderNavbar.svelte";
  import { envelope, envelopeIsSigned } from "$lib/editor/stores";

  interface GOBLDocument {
    $schema: string;
    [key: string]: unknown;
  }

  let data = "";
  let problems: EditorProblem[] = [];
  let jsonSchemaURL = "";
  let defaultSchema = "";
  let builder: GOBLBuilder;
  let state: State = "init";
  let editorView = localStorage.getItem("editor-view") || "code";
  let forceReadOnly = false;

  $: localStorage.setItem("editor-view", editorView);

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

  function handleAction(event: CustomEvent) {
    builder[event.detail]();
  }
</script>

<div class="flex flex-col h-screen">
  <BuilderNavbar
    {state}
    {defaultSchema}
    bind:editorView
    bind:forceReadOnly
    on:load={handleDocLoad}
    on:action={handleAction}
    on:schemaChanged={handleSchemaChange}
  />
  <div class="flex-1 h-full">
    {#if $envelope?.doc}
      <div class="flex items-center md:justify-center py-3 px-3 md:px-4 border-b border-neutral-200 space-x-2">
        <button
          class="px-2 pt-[2.5px] pb-[3.5px] border border-neutral-200 rounded-sm"
          on:click={() => {
            builder.showHeaders();
          }}>Header</button
        >
        {#if $envelopeIsSigned}
          <button
            class="px-2 pt-[2.5px] pb-[3.5px] border border-neutral-200 rounded-sm"
            on:click={() => {
              builder.showSignatures();
            }}>Signatures</button
          >
        {/if}
      </div>
    {/if}
    <GOBLBuilder
      bind:this={builder}
      bind:state
      bind:data
      bind:problems
      {jsonSchemaURL}
      {editorView}
      signEnabled
      {forceReadOnly}
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
