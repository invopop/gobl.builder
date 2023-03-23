<script lang="ts">
  import { editorViewType } from "$lib/stores.js";
  import CodeEditor from "./code/CodeEditor.svelte";
  import FormEditor from "./form/FormEditor.svelte";

  export let jsonSchemaURL: string;
</script>

<div class="flex flex-col h-full border-t-2 border-t-slate-200">
  <div class="relative flex-1 overflow-hidden">
    <div class="h-full absolute inset-0" class:invisible={$editorViewType !== "code"}>
      <CodeEditor {jsonSchemaURL} />
    </div>
    <div class="h-full absolute inset-0" class:invisible={$editorViewType !== "form"}>
      <FormEditor />
    </div>
  </div>
</div>
