<script lang="ts">
  import { fade } from "svelte/transition";
  import { Icon, Trash, DocumentDuplicate } from "svelte-hero-icons";
  import { getFormEditorContext } from "./context/formEditor.js";
  import { createEventDispatcher } from "svelte";
  import FieldButtons from "$lib/editor/form/FieldButtons.svelte";
  import type { UIModelField } from "./utils/model.js";

  const dispatch = createEventDispatcher();

  export let field: UIModelField;
  export let showOptionsMenu = false;

  const { deleteField, duplicateField } = getFormEditorContext() || {};

  function handleClickAddButton(e: CustomEvent<boolean>) {
    showOptionsMenu = false;
    dispatch("addField", e.detail);
  }

  function handleToggleOptionMenu() {
    showOptionsMenu = !showOptionsMenu;
  }

  function handleRemove() {
    deleteField(field);
    showOptionsMenu = false;
  }

  function handleDuplicate() {
    duplicateField(field);
    showOptionsMenu = false;
  }
</script>

<FieldButtons
  {field}
  showAdd={(field.options?.length || field.parent?.options?.length || 0) > 0}
  showOptions={field.is.duplicable || field.is.disposable}
  on:add={handleClickAddButton}
  on:options={handleToggleOptionMenu}
/>

{#if showOptionsMenu}
  <div class="absolute top-11 -left-9 z-10 w-28" transition:fade={{ duration: 200 }}>
    <ul class="grow-0 flex flex-col list-none bg-white border rounded-lg overflow-hidden" role="menu">
      {#if field.is.duplicable}
        <li>
          <button
            on:click={handleDuplicate}
            class="flex items-center justify-start w-full p-2 border-b gap-2 hover:bg-gray-200"
          >
            <Icon src={DocumentDuplicate} class="h-4 w-4 p-0.5" /> Duplicate
          </button>
        </li>
      {/if}
      {#if field.is.disposable}
        <li>
          <button
            on:click={handleRemove}
            class="flex items-center justify-start w-full p-2 gap-2 hover:bg-red-400 hover:text-white"
          >
            <Icon src={Trash} class="h-4 w-4 p-0.5" /> Remove
          </button>
        </li>
      {/if}
    </ul>
  </div>
{/if}
