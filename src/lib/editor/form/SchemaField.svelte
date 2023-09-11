<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import FieldTitle from "./FieldTitle.svelte";
  import { getFormEditorContext } from "./context/formEditor";
  import { jsonSchema } from "../stores";
  import { onMount } from "svelte";
  import { getSchemas } from "../actions";
  import Select from "svelte-select";

  const { updateSchema } = getFormEditorContext() || {};

  export let field: UIModelField<string>;
  export let isEmptySchema = true;

  let schemasList: string[] = [];

  const update = async (e: CustomEvent) => {
    await updateSchema(e.detail.value);
  };

  onMount(async () => {
    const schemas = await getSchemas();
    schemasList = JSON.parse(schemas).list;
  });
</script>

<Tooltip containerClass="block w-full">
  <div class="flex items-center justify-center w-full gap-2">
    <FieldTitle {field} />
    <div class="flex justify-start w-full">
      <Select
        placeholder={isEmptySchema
          ? "In order to build a visual form, validate a $schema first."
          : `$schema must be ${$jsonSchema}`}
        items={schemasList}
        searchable
        showChevron
        on:change={update}
      />
    </div>
  </div>
</Tooltip>
