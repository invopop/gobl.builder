<script lang="ts">
  import "flag-icons/css/flag-icons.min.css";
  import { AccordionItem, Accordion } from "flowbite-svelte";
  import { ChevronDoubleUpOutline, ChevronDoubleDownOutline } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";
  import templateGroups from "./templateData";

  const dispatch = createEventDispatcher();

  async function handleTemplateClick(templatePath: string) {
    const doc = await fetch(templatePath);
    const data = await doc.json();

    dispatch("docLoaded", data);
    dispatch("close");
  }
</script>

<Accordion>
  {#each templateGroups as group, i (i)}
    <AccordionItem
      paddingDefault="0"
      defaultClass="flex items-center justify-between w-full font-medium text-left border-gray-200 dark:border-gray-700"
    >
      <div slot="header" class="w-full p-4">
        <span class={`fi fi-${group.folder}`} />
        <span class="ml-2">{group.name}</span>
      </div>
      <div slot="arrowup" class="p-4">
        <ChevronDoubleUpOutline class="h-3 w-3 -mr-0.5" />
      </div>
      <div slot="arrowdown" class="p-4">
        <ChevronDoubleDownOutline class="h-3 w-3 -mr-0.5" />
      </div>
      <ul class="p-4">
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
    </AccordionItem>
  {/each}
</Accordion>
