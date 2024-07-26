<script lang="ts">
  import type { EditorProblem } from "$lib/editor/EditorProblem.js";
  import EnvelopeEditor from "$lib/EnvelopeEditor.svelte";
  import type { State } from "$lib/types/editor";
  import BuilderNavbar from "../components/BuilderNavbar.svelte";
  import type { EnvelopeHeader, GOBLDocument } from "$lib/types/envelope";
  import EditorFormModalSignatures from "$lib/editor/form/modals/EditorFormModalSignatures.svelte";
  import EditorFormModalHeaders from "$lib/editor/form/modals/EditorFormModalHeaders.svelte";
  import EditorFormModalCorrect from "$lib/editor/form/modals/EditorFormModalCorrect.svelte";
  import type { UIModelField } from "$lib/editor/form/utils/model";

  let data = "";
  let problems: EditorProblem[] = [];
  let jsonSchemaURL = "";
  let defaultSchema = "";
  let builder: EnvelopeEditor;
  let state: State = "init";
  let forceReadOnly = false;
  let envelope = "";
  let editorView = "code";
  let openSignaturesModal = false;
  let sigs: string[] | null = null;
  let openHeadersModal = false;
  let header: EnvelopeHeader | null = null;
  let openCorrectModal = false;
  let correctionModel: UIModelField | undefined;

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

  async function handleAction(event: CustomEvent) {
    if (event.detail === "showSignatures") {
      sigs = await builder.getSignatures();
      openSignaturesModal = true;
      return;
    }

    if (event.detail === "showHeaders") {
      header = await builder.getHeaders();
      openHeadersModal = true;
      return;
    }

    if (event.detail === "correct") {
      correctionModel = await builder.getCorrectionOptionsModel();
      openCorrectModal = true;
      return;
    }

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
      <EnvelopeEditor
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
        on:correct={(event) => {
          console.log("Received correct result.", event.detail);
        }}
      />
    </div>
  </div>
</div>
{#if openSignaturesModal}
  <EditorFormModalSignatures
    {sigs}
    on:close={() => {
      openSignaturesModal = false;
      sigs = null;
    }}
  />
{/if}

{#if openHeadersModal}
  <EditorFormModalHeaders
    {header}
    on:close={() => {
      openHeadersModal = false;
      header = null;
    }}
    on:confirm={(event) => {
      builder.setHeaders(event.detail);
      openHeadersModal = false;
    }}
  />
{/if}

{#if openCorrectModal}
  <EditorFormModalCorrect
    model={correctionModel}
    on:close={() => {
      openCorrectModal = false;
    }}
    on:confirm={async (event) => {
      const result = await builder.correctWithOptions(event.detail);
      openCorrectModal = !result;
    }}
  />
{/if}
