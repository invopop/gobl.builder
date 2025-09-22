<script lang="ts">
  import SelectSchemas from "$lib/SelectSchemas.svelte";
  import { getBuilderContext } from "$lib/store/builder";

  const { jsonSchema, updateSchema } = getBuilderContext();

  interface Props {
    isEmptySchema?: boolean;
  }

  let { isEmptySchema = true }: Props = $props();

  const update = async (e: CustomEvent) => {
    await updateSchema(e.detail);
  };
</script>

{#if !isEmptySchema}
  <div class="rounded-md bg-blue-50 p-4 mb-8">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div class="ml-3 flex-1 md:flex md:justify-between">
        <p class="text-sm text-blue-700">
          {`$schema must be ${$jsonSchema}`}
        </p>
      </div>
    </div>
  </div>
{/if}
{#if isEmptySchema}
  <SelectSchemas placeholder="Select a $schema..." on:change={update} />
{:else}
  <div class="flex items-center justify-center">
    <button class="border py-2 px-6 hover:border-blue-400" onclick={() => updateSchema($jsonSchema || "")}>Fix</button>
  </div>
{/if}
