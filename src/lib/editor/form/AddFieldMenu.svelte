<script lang="ts">
  import { run } from 'svelte/legacy';

  import { fade } from "svelte/transition";
  import hover from "./action/hover.js";
  import { createEventDispatcher } from "svelte";
  import { sleep } from "./utils/sleep.js";
  import type { SchemaOption, UIModelField } from "./utils/model.js";
  import clickOutside from "$lib/clickOutside.js";
  import { Icon } from "svelte-hero-icons";
  import { Search } from "@invopop/ui-icons";
  import BaseButton from "$lib/ui/BaseButton.svelte";

  interface Props {
    field: UIModelField;
    inputRef?: HTMLElement | undefined;
    menuRef?: HTMLElement | undefined;
  }

  let { field, inputRef = $bindable(undefined), menuRef = $bindable(undefined) }: Props = $props();
  let checkboxesRef: HTMLInputElement[] = $state([]);

  let focusedOptionIndex = $state(-1);
  let selection: string[] = $state([]);
  let filterStr = $state("");

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

  let options = $derived(filterOptions(field.options || [], filterStr));

  run(() => {
    inputRef?.focus();
  });

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

  function handleAddFields() {
    handleCloseMenu();

    const addedFields: (UIModelField | undefined)[] = [];

    selection.forEach((fieldKey) => {
      const option = options.find((o) => o.key === fieldKey);

      if (!option) return;

      const newField = field.addChildField(option);

      addedFields.push(newField);

      dispatch("fieldAdded", newField);
    });

    // Focus first field added
    addedFields[0]?.tryFocus();
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
      checkboxesRef[focusedOptionIndex]?.focus();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      focusedOptionIndex = Math.max(focusedOptionIndex - 1, 0);
      menuRef?.children[focusedOptionIndex].scrollIntoView({ block: "center" });
      menuRef?.scrollIntoView({ block: "center" });
      checkboxesRef[focusedOptionIndex]?.focus();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (options.length === 0) return;
      handleAddFields();
      return;
    }
  }

  function handleHoverListItem(i: number) {
    focusedOptionIndex = i;
  }
</script>

<div
  transition:fade={{ duration: 200 }}
  class="cursor-text rounded-lg shadow overflow-hidden bg-white"
  use:clickOutside
  onclose={handleCloseMenu}
>
  <div class="px-2 pt-2 pb-1 relative">
    <input
      class="rounded-md py-1.5 pr-3 pl-7 outline-none w-full placeholder-neutral-500 focus:placeholder-neutral-500 border text-base tracking-normal"
      placeholder="Search"
      bind:value={filterStr}
      bind:this={inputRef}
      onfocus={handleOpenMenu}
      onkeydown={handleKeyDown}
    />
    <span class="absolute top-4 left-4 mt-px text-neutral-500">
      <Icon src={Search} class="w-4 h-4" />
    </span>
  </div>
  <div transition:fade={{ duration: 200 }}>
    <ul class="list-none max-h-80 overflow-auto p-1 space-y-0.5" role="menu" bind:this={menuRef}>
      {#if options.length}
        {#each options as opt, i (opt.key)}
          <li
            class="pl-2 pr-1.5 py-1.5 rounded flex items-center justify-between space-x-2"
            class:bg-neutral-50={i === focusedOptionIndex}
            onhover={() => handleHoverListItem(i)}
            use:hover
          >
            <label class="flex justify-between w-full">
              <span class="text-neutral-800 text-base font-medium">
                <span>{opt.schema.title || opt.key}</span>
                {#if opt.schema.calculated}
                  <span class="text-xs text-gray-700">(Calculated)</span>
                {/if}
              </span>
              <input
                type="checkbox"
                bind:this={checkboxesRef[i]}
                bind:group={selection}
                value={opt.key}
                onkeydown={handleKeyDown}
                class="form-checkbox w-5 h-5 text-workspace-accent-500 focus:text-workspace-accent-500 rounded border border-neutral-200 focus:ring-0 focus:ring-offset-0"
              />
            </label>
          </li>
        {/each}
      {:else}
        <li>
          <span class="w-full py-3 px-6 text-neutral-500 text-left">
            <span>No items found</span>
          </span>
        </li>
      {/if}
    </ul>
    <div class="pb-2 pt-1 px-2 flex items-center justify-center">
      <BaseButton variant="primary" on:click={handleAddFields}>Add items</BaseButton>
    </div>
  </div>
</div>
