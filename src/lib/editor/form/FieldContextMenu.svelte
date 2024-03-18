<script lang="ts">
  import { createEventDispatcher, tick } from "svelte";
  import FieldButtons from "$lib/editor/form/FieldButtons.svelte";
  import type { UIModelField } from "./utils/model.js";
  import { Icon } from "svelte-hero-icons";
  import { Options } from "@invopop/ui-icons";

  const dispatch = createEventDispatcher();

  let showButtons = false;

  export let field: UIModelField;

  function handleRemove() {
    field.delete();
    dispatch("fieldDeleted", field);
  }

  function handleDuplicate() {
    const newField = field.duplicate();
    if (!newField) return;

    const focusField = newField.getFirstFocusableChild();

    if (!focusField) return;

    focusField.tryFocus();
    dispatch("fieldDuplicated", newField);
  }

  async function handleModeFieldUp() {
    const destinationField = field.move("up");
    dispatch("fieldMoved", field);
    await tick();
    destinationField?.tryFocus();
  }

  async function handleModeFieldDown() {
    const destinationField = field.move("down");
    dispatch("fieldMoved", field);
    await tick();
    destinationField?.tryFocus();
  }

  function handleHover() {
    showButtons = true;
  }

  function handleBlur() {
    showButtons = false;
  }
</script>

<div class="relative">
  <button on:mouseenter={handleHover} class="p-1 rounded border border-neutral-200">
    <Icon src={Options} class="h-4 w-4 text-neutral-800" />
  </button>
  {#if showButtons}
    <button on:mouseleave={handleBlur} class="absolute top-[-4px] right-[-4px]">
      <FieldButtons
        {field}
        on:add={() => dispatch("addField")}
        on:duplicate={handleDuplicate}
        on:remove={handleRemove}
        on:moveUp={handleModeFieldUp}
        on:moveDown={handleModeFieldDown}
      />
    </button>
  {/if}
</div>
