<script lang="ts">
  import type { SchemaValue } from "$lib/editor/form/utils/schema.js";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import EditableTextField from "./EditableTextField.svelte";
  import { Icon, PencilSquare } from "svelte-hero-icons";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let parseKey: (key: SchemaValue) => string = (key) => (key + "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
  export let field: UIModelField<string>;

  let inputValue: SchemaValue = field.key;

  function handleEdit(e: CustomEvent<SchemaValue>) {
    const value = e.detail;
    if (!value) return;

    inputValue = value;
  }

  function handleBlur() {
    if (!inputValue) return;

    const parsedKey = parseKey(inputValue);
    const result = field.setKey(parsedKey);
    if (!result) return;
    dispatch("fieldKeyUpdated", field);
  }
</script>

<span class="flex items-center justify-start">
  <Icon src={PencilSquare} solid class="h-6 w-6 mr-2 text-neutral-500" />
  <EditableTextField {field} id={`${field.id}-key`} value={field.key} on:edit={handleEdit} on:blur={handleBlur} />
</span>
