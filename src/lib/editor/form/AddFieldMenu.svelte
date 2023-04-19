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
  export let menuRef: HTMLElement | undefined = undefined;
  export let position: number | undefined = undefined;

  let showContextMenu = false;
  let showAddMenu = false;
  let filterStr = "";
  let debug = false;

  const dispatch = createEventDispatcher();

  const { addField } = getFormEditorContext() || {};

  function filterOptions(options: SchemaOption[], filterStr: string) {
    return options
      .filter((opt) => opt.key.toLowerCase().includes(filterStr.toLocaleLowerCase()))
      .sort((a, b) => {
        return (a.required && b.required) || (!a.required && !b.required)
          ? a.key.localeCompare(b.key)
          : a.required
          ? -1
          : 1;
      });
  }

  $: options = filterOptions(field.options || [], filterStr);
  $: focusedOptionIndex = options.length > 0 ? 0 : -1;

  $: {
    inputRef?.focus();
  }

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
    addField(parentField, option, position);
    showAddMenu = false;
    showContextMenu = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    e.stopImmediatePropagation();

    if (e.key === "Escape") {
      e.preventDefault();
      handleCloseMenu();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusedOptionIndex = Math.min(focusedOptionIndex + 1, options.length - 1);
      menuRef?.children[focusedOptionIndex].scrollIntoView({ block: "center" });
      menuRef?.scrollIntoView({ block: "center" });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      focusedOptionIndex = Math.max(focusedOptionIndex - 1, 0);
      menuRef?.children[focusedOptionIndex].scrollIntoView({ block: "center" });
      menuRef?.scrollIntoView({ block: "center" });
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (options.length === 0) return;
      handleAddField(field, options[focusedOptionIndex]);
      return;
    }
  }

  function handleHoverListItem(i: number) {
    focusedOptionIndex = i;
  }
</script>

<div
  class="relative cursor-text flex w-full p-2 pl-0 expanded-area"
  on:click={handleOpenMenu}
  on:hover={handleHover}
  use:hover
  transition:fade={{ duration: 200 }}
>
  {#if showContextMenu}
    <FieldButtons showAdd={true} showOptions={false} on:add={handleOpenMenu} on:options={handleOpenMenu} />
  {/if}
  <input
    class="
      h-8 py-1.5 p-2 relative outline-none w-full bg-transparent placeholder-gray-500 rounded rounded-b-none
      focus:text-gray-500 focus:border focus:border-gray-400 focus:bg-white focus:placeholder-gray-300
    "
    placeholder={!showAddMenu ? "Add field" : "Select a new type of field to add"}
    bind:value={filterStr}
    bind:this={inputRef}
    on:focus={handleOpenMenu}
    on:blur={handleCloseMenu}
    on:keydown={handleKeyDown}
  />

  {#if showAddMenu}
    <div class="block absolute top-full -mt-4 left-0 z-10 w-full p-2 pl-0" transition:fade={{ duration: 200 }}>
      <ul
        class="grow-0 flex flex-col list-none bg-white border border-gray-400 border-t-0 rounded rounded-t-none h-40 overflow-scroll"
        role="menu"
        bind:this={menuRef}
      >
        {#if options.length}
          {#each options as opt, i (opt.key)}
            <li
              class:bg-gray-200={i === focusedOptionIndex}
              class:border-b={i < options.length - 1}
              on:hover={() => handleHoverListItem(i)}
              use:hover
            >
              <button
                class="flex items-center justify-start w-full p-2 gap-2 capitalize h-8"
                class:font-bold={opt.required}
                on:click|stopPropagation={() => handleAddField(field, opt)}
              >
                {#if debug}<Icon
                    src={opt.schema.type === "string" ? Document : DocumentDuplicate}
                    class="h-4 w-4"
                  />{/if}
                {opt.schema.title || opt.key}
                {#if debug}{opt.required ? "*" : ""} ({opt.schema.type}){/if}
              </button>
            </li>
          {/each}
        {:else}
          <li>
            <span class="flex items-center justify-start w-full p-2 gap-2 h-8">
              No items found matching filter: <strong>"{filterStr}"</strong>
            </span>
          </li>
        {/if}
      </ul>
    </div>
  {/if}
</div>
