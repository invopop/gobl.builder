<script lang="ts">
  import type { EditorProblem } from "$lib/editor/EditorProblem.js";
  import GOBLBuilder from "$lib/GOBLBuilder.svelte";
  import type { State } from "$lib/types/editor";
  import BuilderNavbar from "$lib/BuilderNavbar.svelte";
  import type { GOBLDocument } from "$lib/types/envelope";

  let data = "";
  let problems: EditorProblem[] = [];
  let jsonSchemaURL = "";
  let defaultSchema = "";
  let builder: GOBLBuilder;
  let state: State = "init";
  let forceReadOnly = false;
  let envelope = "";
  let editorView = "code";

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

<div class="flex flex-col h-screen bg-gobl-900">
  <BuilderNavbar
    {state}
    {defaultSchema}
    {envelope}
    bind:forceReadOnly
    bind:editorView
    on:load={handleDocLoad}
    on:action={handleAction}
    on:schemaChanged={handleSchemaChange}
  />
  <div class="flex-1 h-full p-1 pt-14">
    <div class="h-full bg-white rounded-t-lg">
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
          envelope = event.detail.envelope;
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
</div>
