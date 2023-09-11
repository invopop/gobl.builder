<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import FieldTitle from "./FieldTitle.svelte";
  import { getFormEditorContext } from "./context/formEditor";
  import { toast } from "@zerodevx/svelte-toast";
  import { jsonSchema } from "../stores";
  import { onMount } from "svelte";
  import { getSchemas } from "../actions";
  import Select from "svelte-select";
  import LoadingIcon from "$lib/ui/LoadingIcon.svelte";

  const { updateSchema } = getFormEditorContext() || {};

  export let field: UIModelField<string>;
  export let isEmptySchema = true;

  let updatingSchema = false;
  let schemasList: string[] = [];

  const update = async (e: CustomEvent) => {
    updatingSchema = true;
    const result = await updateSchema(e.detail.value);

    if (!result) {
      updatingSchema = false;
      toast.push(`${e.detail.value} is not a valid $schema`, {
        reversed: true,
        intro: { y: 192 },
        theme: {
          "--toastColor": "rgb(75 85 99)",
          "--toastBackground": "rgb(255 228 230)",
          "--toastBarBackground": "rgb(225 29 72)",
        },
      });
    }
  };

  onMount(async () => {
    const schemas = await getSchemas();
    schemasList = JSON.parse(schemas).list;
  });
</script>

{#if updatingSchema}
  <div class="text-center mt-6 w-full flex items-center justify-center"><LoadingIcon /></div>
{:else}
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
{/if}
