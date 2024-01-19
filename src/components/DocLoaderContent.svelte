<script lang="ts">
  import "flag-icons/css/flag-icons.min.css";
  import { AccordionItem, Accordion } from "flowbite-svelte";
  import { createEventDispatcher } from "svelte";
  import templateGroups from "./templateData";

  const dispatch = createEventDispatcher();

  async function handleTemplateClick(templatePath: string) {
    const doc = await fetch(templatePath);
    const data = await doc.json();

    dispatch("docLoaded", data);
    dispatch("close");
  }

  $: countries = templateGroups.filter((t) => t.folder !== "misc");
  $: other = templateGroups.filter((t) => t.folder === "misc");
</script>

<Accordion activeClass="border-b-0">
  {#each countries as group, i (i)}
    <AccordionItem
      paddingDefault="0"
      defaultClass="flex items-center justify-between w-full font-medium text-left border-neutral-200 rounded border-t mt-3"
    >
      <div slot="header" class="flex items-center space-x-2 w-full pl-[14px] py-[10px]">
        <span class={`rounded fi fi-${group.folder}`} />
        <span class="text-neutral-800 font-semibold flex-1">{group.name}</span>
      </div>
      <div slot="arrowup" class="pr-3">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8" fill="#F3F5F5" />
          <path d="M13.5 11.75L10 8.25L6.5 11.75" stroke="#0A0A0A" stroke-width="1.1" />
        </svg>
      </div>
      <div slot="arrowdown" class="pr-3">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8" fill="#F3F5F5" />
          <path d="M6.5 8.25004L10 11.75L13.5 8.25" stroke="#0A0A0A" stroke-width="1.2" />
        </svg>
      </div>
      <ul class="px-1.5 pb-[10px]">
        {#each group.templates as template}
          <li
            class="pl-2 pr-3 py-[5px] border rounded border-transparent hover:border-neutral-200 hover:bg-neutral-100"
          >
            <button
              class="text-left w-full text-sm font-medium text-background-500"
              on:click={() => handleTemplateClick(`/templates/${group.folder}/${template.file}`)}
            >
              {template.name}
            </button>
          </li>
        {/each}
      </ul>
    </AccordionItem>
  {/each}
  <div class="border-b border-dotted my-4" />
  {#each other as group, i (i)}
    <AccordionItem
      paddingDefault="0"
      defaultClass="flex items-center justify-between w-full font-medium text-left border-neutral-200 rounded border-t mt-3"
    >
      <div slot="header" class="flex items-center w-full pl-[14px] py-[10px]">
        <span class="text-neutral-800 font-semibold flex-1">{group.name}</span>
      </div>
      <div slot="arrowup" class="pr-3">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8" fill="#F3F5F5" />
          <path d="M13.5 11.75L10 8.25L6.5 11.75" stroke="#0A0A0A" stroke-width="1.1" />
        </svg>
      </div>
      <div slot="arrowdown" class="pr-3">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8" fill="#F3F5F5" />
          <path d="M6.5 8.25004L10 11.75L13.5 8.25" stroke="#0A0A0A" stroke-width="1.2" />
        </svg>
      </div>
      <ul class="px-1.5 pb-[10px]">
        {#each group.templates as template}
          <li
            class="pl-2 pr-3 py-[5px] border rounded border-transparent hover:border-neutral-200 hover:bg-neutral-100"
          >
            <button
              class="text-left w-full text-sm font-medium text-background-500"
              on:click={() => handleTemplateClick(`/templates/${group.folder}/${template.file}`)}
            >
              {template.name}
            </button>
          </li>
        {/each}
      </ul>
    </AccordionItem>
  {/each}
</Accordion>
