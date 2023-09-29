<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import DocLoaderRegimePicker from "./DocLoaderRegimePicker.svelte";
  import templateGroups from "./templateData";

  const dispatch = createEventDispatcher();

  let regime = "Spain";

  $: filteredGroups = templateGroups.filter((g) => g.name === regime);

  async function handleTemplateClick(templatePath: string) {
    const doc = await fetch(templatePath);
    const data = await doc.json();

    dispatch("docLoaded", data);
    dispatch("close");
  }
</script>

<div class="h-80 overflow-hidden">
  <DocLoaderRegimePicker bind:regime />
  {#each filteredGroups as group}
    <div class="my-6">
      <p class="block text-sm font-medium leading-6 text-gray-900 mb-2">Select a template</p>
      <ul>
        {#each group.templates as template}
          <li>
            <button
              class="inline-flex gap-2 items-center hover:text-sky-500"
              on:click={() => handleTemplateClick(`/templates/${group.folder}/${template.file}`)}
            >
              <svelte:component this={template.icon} />
              {template.name}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</div>
