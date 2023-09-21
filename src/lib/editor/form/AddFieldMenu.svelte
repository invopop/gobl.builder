<script lang="ts">
  import { fade } from "svelte/transition";
  import hover from "./action/hover.js";
  import { createEventDispatcher } from "svelte";
  import { sleep } from "./utils/sleep.js";
  import type { SchemaOption, UIModelField } from "./utils/model.js";
  import clickOutside from "$lib/clickOutside.js";

  export let field: UIModelField;
  export let inputRef: HTMLElement | undefined = undefined;
  export let menuRef: HTMLElement | undefined = undefined;

  let filterStr = "";

  const dispatch = createEventDispatcher();

  function filterOptions(options: SchemaOption[], filterStr: string) {
    return options
      .filter((opt) => {
        const foundInKey = opt.key.toLowerCase().includes(filterStr.toLocaleLowerCase());
        const title = opt.schema.title || "";
        const foundInTitle = title.toLowerCase().includes(filterStr.toLocaleLowerCase());

        return foundInKey || foundInTitle;
      })
      .sort((a, b) => {
        const aRequired = a.required && !a.schema.calculated;
        const bRequired = b.required && !b.schema.calculated;

        if ((aRequired && bRequired) || (!aRequired && !bRequired)) {
          return 0;
        }

        return aRequired ? -1 : 1;
      });
  }

  $: options = filterOptions(field.options || [], filterStr);
  $: focusedOptionIndex = options.length > 0 ? 0 : -1;

  $: {
    inputRef?.focus();
  }

  function handleOpenMenu() {
    inputRef?.focus();
    dispatch("openAddFieldMenu");
  }

  async function handleCloseMenu() {
    await sleep(100);
    filterStr = "";
    inputRef?.blur();
    dispatch("closeAddFieldMenu");
  }

  function handleAddField(parentField: UIModelField, option: SchemaOption) {
    handleCloseMenu();
    const newField = parentField.addChildField(option);
    newField?.tryFocus();
    dispatch("fieldAdded", newField);
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
  transition:fade={{ duration: 200 }}
  class="cursor-text rounded border overflow-hidden bg-white"
  use:clickOutside
  on:close={handleCloseMenu}
>
  <input
    class="py-3 px-6 outline-none w-full placeholder-grey-3 focus:placeholder-grey-3 border-b"
    placeholder="Type field name or select below"
    bind:value={filterStr}
    bind:this={inputRef}
    on:focus={handleOpenMenu}
    on:keydown={handleKeyDown}
  />
  <div transition:fade={{ duration: 200 }}>
    <ul class="list-none h-80 overflow-auto" role="menu" bind:this={menuRef}>
      {#if options.length}
        {#each options as opt, i (opt.key)}
          <li
            class:bg-color2={i === focusedOptionIndex}
            class:border-t={i > 0}
            on:hover={() => handleHoverListItem(i)}
            use:hover
          >
            <button
              class="flex flex-col w-full py-3 px-6 text-grey-5 text-left"
              on:click|stopPropagation={() => handleAddField(field, opt)}
            >
              <div class="mb-1 text-grey-4 font-medium" class:font-bold={opt.required} class:text-black={opt.required}>
                <span>{opt.schema.title || opt.key}</span>
                {#if opt.schema.calculated}
                  <span class="text-xs text-gray-700">(Calculated)</span>
                {/if}
              </div>
              <div
                class="text-grey-5 text-md"
                class:font-bold={opt.required && !opt.schema.calculated}
                class:text-black={opt.required}
              >
                {opt.schema.description}
              </div>
            </button>
          </li>
        {/each}
      {:else}
        <li>
          <span class="emptyFilter">
            <span>No items found</span>
            {#if filterStr}
              <span>matching filter: <strong>"{filterStr}"</strong></span>
            {/if}
          </span>
        </li>
      {/if}
    </ul>
  </div>
</div>

<style lang="postcss">
  span.emptyFilter {
    @apply block w-full py-3 px-6 text-grey-5 text-left;
  }
</style>
