<script lang="ts">
  import { fade } from "svelte/transition";

  import FieldButtons from "$lib/editor/form/FieldButtons.svelte";
  import hover from "./action/hover.js";
  import { DocumentDuplicate, Document, Icon } from "svelte-hero-icons";
  import { getFormEditorContext } from "./context/formEditor.js";
  import { createEventDispatcher } from "svelte";
  import { sleep } from "./utils/sleep.js";
  import type { SchemaOption, UIModelField } from "./utils/model.js";

  export let field: UIModelField;
  export let inputRef: HTMLElement | undefined = undefined;

  let showContextMenu = false;
  let showAddMenu = false;
  let filterStr = "";

  const dispatch = createEventDispatcher();

  const { addField } = getFormEditorContext() || {};

  $: options = (field.options || [])
    .filter((opt) => opt.key.toLowerCase().includes(filterStr.toLocaleLowerCase()))
    .sort((a, b) => {
      return (a.required && b.required) || (!a.required && !b.required)
        ? a.key.localeCompare(b.key)
        : a.required
        ? -1
        : 1;
    });

  function handleOpenMenu() {
    showAddMenu = true;
    showContextMenu = false;
    inputRef?.focus();
    dispatch("openAddFieldMenu");
  }

  async function handleCloseMenu() {
    await sleep(100);
    showAddMenu = false;
    filterStr = "";
    inputRef?.blur();
    dispatch("closeAddFieldMenu");
  }

  function handleHover(e: CustomEvent<boolean>) {
    if (showAddMenu) return;
    showContextMenu = e.detail;
  }

  function handleAddField(parentField: UIModelField, option: SchemaOption) {
    addField(parentField, option);
    showAddMenu = false;
    showContextMenu = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== "Escape") return;
    return handleCloseMenu();
  }
</script>

<div
  class="relative cursor-text p-2 flex w-full"
  class:focus={showAddMenu}
  on:click={handleOpenMenu}
  on:hover={handleHover}
  use:hover
  transition:fade={{ duration: 200 }}
>
  {#if showContextMenu}
    <FieldButtons showAdd={true} showOptions={true} on:add={handleOpenMenu} on:options={handleOpenMenu} />
  {/if}
  <div
    class="relative outline-none w-full"
    class:placeholder={!showAddMenu}
    class:placeholder-focus={showAddMenu && !filterStr}
    contenteditable
    bind:textContent={filterStr}
    bind:this={inputRef}
    on:focus={handleOpenMenu}
    on:blur={handleCloseMenu}
    on:keydown={handleKeyDown}
  />

  {#if showAddMenu}
    <div class="block absolute top-full left-0 z-10 w-full" transition:fade={{ duration: 200 }}>
      <ul
        class="grow-0 flex flex-col list-none bg-white border rounded-lg rounded-t-none h-40 overflow-scroll"
        role="menu"
      >
        {#each options as opt, i (opt.key)}
          <li>
            <button
              class="flex items-center justify-start w-full p-2 gap-2 hover:bg-gray-200 capitalize"
              class:font-bold={opt.required}
              class:border-b={i < options.length - 1}
              on:click|stopPropagation={() => handleAddField(field, opt)}
            >
              <Icon src={opt.schema.type === "string" ? Document : DocumentDuplicate} class="h-4 w-4" />
              {opt.schema.title || opt.key}{opt.required ? "*" : ""} ({opt.schema.type})
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style lang="postcss">
  .placeholder::before {
    content: "Add field";
    @apply text-gray-300;
  }

  .placeholder-focus,
  .focus {
    @apply text-gray-500 bg-transparent;
  }

  .placeholder-focus::before {
    content: "Select a new type of field to add";
    @apply text-gray-300;
  }
</style>
