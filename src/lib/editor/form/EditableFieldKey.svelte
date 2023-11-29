<script lang="ts">
  import type { SchemaValue } from "$lib/editor/form/utils/schema.js";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import EditableTextField from "./EditableTextField.svelte";
  import { Icon, Pencil } from "svelte-hero-icons";
  import { createEventDispatcher, tick } from "svelte";
  import FieldTitle from "./FieldTitle.svelte";

  const dispatch = createEventDispatcher();

  export let parseKey: (key: SchemaValue) => string = (key) => (key + "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
  export let field: UIModelField<string>;
  export let readOnly = false;

  let editing = false;
  let inputValue: SchemaValue = field.key;

  function handleEdit(e: CustomEvent<SchemaValue>) {
    const value = e.detail;
    if (!value) return;

    inputValue = value;
  }

  function handleSave() {
    editing = false;

    if (!inputValue) return;

    const parsedKey = parseKey(inputValue);
    const result = field.setKey(parsedKey);
    if (!result) return;
    dispatch("fieldKeyUpdated", field);
  }

  async function handleEditing() {
    editing = true;
    await tick();
    const el = document.querySelector(`#${field.id}-key`) as HTMLElement;
    el.focus();
  }

  function onKeyPress(e: KeyboardEvent) {
    e.stopImmediatePropagation();
    if (e.key === "Enter") {
      handleSave();
    }
  }
</script>

<span class="flex items-center justify-start space-x-1 w-full">
  {#if editing}
    <div class="relative w-full">
      <EditableTextField
        {field}
        {readOnly}
        id={`${field.id}-key`}
        value={field.key}
        on:edit={handleEdit}
        on:keypress={onKeyPress}
      />
      <button
        class="absolute top-1 right-1 border rounded px-3 h-6 bg-neutral-100 border-neutral-200 text-sm text-neutral-800"
        on:click={handleSave}>Save</button
      >
    </div>
  {:else}
    <FieldTitle {field} />
    <button on:click={handleEditing}>
      <Icon src={Pencil} class="h-4 w-4 text-accent-500" />
    </button>
  {/if}
</span>
