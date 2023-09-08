<script lang="ts">
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import Tooltip from "$lib/ui/Tooltip.svelte";
  import FieldTitle from "./FieldTitle.svelte";
  import EditableTextField from "./EditableTextField.svelte";
  import { getFormEditorContext } from "./context/formEditor";
  import { toast } from "@zerodevx/svelte-toast";
  import { jsonSchema } from "../stores";

  const { updateSchema } = getFormEditorContext() || {};

  export let field: UIModelField<string>;
  export let isEmptySchema = true;

  let updatingSchema = false;
  let value = field.value;

  const handleUpdate = (e: CustomEvent) => {
    value = e.detail;
  };

  const update = async () => {
    updatingSchema = true;
    const result = await updateSchema(value);

    if (!result) {
      updatingSchema = false;
      toast.push(`${value} is not a valid $schema`, {
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
</script>

<Tooltip label={field.schema.description} delay={200} containerClass="block w-full">
  <div class="flex items-stretch justify-between w-full gap-2">
    <div class="flex items-start justify-start">
      <FieldTitle {field} />
    </div>
    <div class="flex justify-start w-full" class:opacity-30={updatingSchema} class:pointer-events-none={updatingSchema}>
      <EditableTextField {field} on:edit={handleUpdate} />
      <button disabled={updatingSchema} class="ml-1 border px-2 flex items-center justify-center" on:click={update}
        >{updatingSchema ? "Validating..." : "Validate"}</button
      >
    </div>
  </div>
</Tooltip>
{#if !updatingSchema}
  <div class="rounded-md bg-blue-50 p-4 mt-4">
    <div class="flex">
      <div class="ml-3 flex-1 md:flex justify-center">
        <p class="text-sm text-blue-500">
          {isEmptySchema
            ? "In order to build a visual form, please, validate a $schema first."
            : `$schema must be ${$jsonSchema}`}
        </p>
      </div>
    </div>
  </div>
{/if}
