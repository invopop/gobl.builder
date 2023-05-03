<script lang="ts">
  import DocumentStatus from "./DocumentStatus.svelte";
  import EditorViewCode from "$lib/actions/EditorViewCode.svelte";
  import EditorViewForm from "$lib/actions/EditorViewForm.svelte";
  import ButtonsToolbar from "./ButtonsToolbar.svelte";

  export let jsonSchemaURL: string;
  export let signEnabled: boolean;
</script>

<div class="flex items-center justify-between py-2.5 px-6 text-xs text-color4 border-b border-grey-1">
  <div class="flex-1 flex justify-start">
    <DocumentStatus />
  </div>
  <div class="flex-1 flex justify-center">
    <div class="inline-flex bg-color3 border border-grey-1 rounded">
      <EditorViewForm on:viewForm />
      <EditorViewCode on:viewCode />
    </div>
  </div>
  <div class="flex-1 flex justify-end">
    <ButtonsToolbar {jsonSchemaURL} {signEnabled} />
  </div>
</div>
