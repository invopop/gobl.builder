<script lang="ts">
  import DocumentStatus from "./DocumentStatus.svelte";
  import EditorViewCode from "$lib/actions/EditorViewCode.svelte";
  import EditorViewForm from "$lib/actions/EditorViewForm.svelte";
  import ButtonsToolbar from "./ButtonsToolbar.svelte";

  export let jsonSchemaURL: string;
  export let signEnabled: boolean;
</script>

<div class="flex items-center justify-between py-2 px-8 text-xs text-gray-700">
  <div class="flex-1 flex justify-start">
    <DocumentStatus />
  </div>
  <div class="flex-1 flex justify-center">
    <div class="inline-flex p-1 bg-slate-100 border border-slate-200 rounded-md">
      <EditorViewForm on:viewForm />
      <EditorViewCode on:viewCode />
    </div>
  </div>
  <div class="flex-1 flex justify-end">
    <ButtonsToolbar {jsonSchemaURL} {signEnabled} />
  </div>
</div>
