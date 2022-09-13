<script lang="ts">
  import GOBLBuilder from "$lib/GOBLBuilder.svelte";
  import DocLoader from "../components/DocLoader.svelte";
  import logo from "../static/logo-light.svg";

  const DEFAULT_JSON_SCHEMA_URL = "https://gobl.org/draft-0/bill/invoice";

  interface GOBLDocument {
    $schema: string;
    [key: string]: unknown;
  }

  let value = "";
  let jsonSchemaURL = DEFAULT_JSON_SCHEMA_URL;

  function handleDocLoad(event: CustomEvent<GOBLDocument>) {
    value = JSON.stringify(event.detail, null, 4);
    jsonSchemaURL = event.detail.$schema;
  }
</script>

<div class="flex flex-col h-screen">
  <div class="flex-none flex gap-4 items-center pl-4 pr-2 py-2.5 bg-gray-800">
    <img src={logo} class="w-8 h-8" alt="GOBL logo" title="GOBL Builder" />
    <DocLoader on:load={handleDocLoad} />
  </div>
  <div class="flex-1 h-full overflow-hidden">
    <GOBLBuilder {value} {jsonSchemaURL} />
  </div>
</div>
