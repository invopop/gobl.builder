<script lang="ts">
  import type { SchemaValue } from "$lib/editor/form/utils/schema.js";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import { getFormEditorContext } from "./context/formEditor.js";

  export let parseValue: (value: SchemaValue) => SchemaValue;
  export let field: UIModelField<string>;

  const { changeField } = getFormEditorContext() || {};

  function handleChange(e: Event & { currentTarget: HTMLSelectElement | HTMLInputElement }) {
    const value = e.currentTarget?.value;
    if (!value) return;

    const parsedValue = parseValue(value);
    changeField(field, parsedValue);
  }
</script>

{#if field.schema.format === "date"}
  <input
    type="date"
    id={field.id}
    value={field.value}
    on:change={handleChange}
    class="outline-none bg-transparent w-24 text-gray-500"
  />
{:else if field.schema.oneOf}
  <select
    id={field.id}
    value={field.value || field.schema.oneOf[0].const}
    on:change={handleChange}
    class="text-ellipsis w-20 outline-none bg-transparent text-gray-500"
  >
    {#each field.schema.oneOf as opt, i (opt.const)}
      <option value={opt.const} selected={field.value ? field.value === opt.const : i === 0}
        >{opt.description || opt.const}</option
      >
    {/each}
  </select>
{:else}
  <input
    type="text"
    id={field.id}
    value={field.value}
    on:change={handleChange}
    class="outline-none min-w-full bg-transparent text-gray-500"
  />
{/if}
