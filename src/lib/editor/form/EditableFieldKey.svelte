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
</script>

<span class="flex items-center justify-start space-x-1 w-full">
  {#if editing}
    <div class="relative w-full">
      <EditableTextField {field} id={`${field.id}-key`} value={field.key} on:edit={handleEdit} on:blur={handleSave} />
    </div>
  {:else}
    <FieldTitle {field} />
    {#if !readOnly}
      <button on:click={handleEditing}>
        <Icon src={Pencil} class="h-4 w-4 text-accent-500" />
      </button>
    {/if}
  {/if}
</span>
