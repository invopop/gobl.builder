<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { editor, envelope } from "../stores";
  import { schemaIconMap } from "../ui/schemaIconMap.svelte";

  import esInvoice from "../templates/es/invoice.json";
  import esInvoiceRevCharge from "../templates/es/invoice-rev-charge.json";
  import esInvoiceFreelance from "../templates/es/invoice-freelance.json";
  import nlInvoice from "../templates/nl/invoice.json";

  import message from "../templates/misc/message.json";
  import classNames from "classnames";

  const dispatch = createEventDispatcher();

  type Template = {
    name: string;
    value: TemplateValue;
  };

  type TemplateValue = {
    $schema: string;
    [field: string]: unknown;
  };

  const templateGroups = new Map<string, Map<string, Template>>([
    [
      "Spain",
      new Map([
        [
          "es-invoice",
          {
            name: "Invoice",
            value: esInvoice as TemplateValue,
          },
        ],
        [
          "es-invoice-rev-charge",
          {
            name: "Invoice (reverse charge)",
            value: esInvoiceRevCharge as TemplateValue,
          },
        ],
        [
          "es-invoice-freelance",
          {
            name: "Invoice (freelance)",
            value: esInvoiceFreelance as TemplateValue,
          },
        ],
      ]),
    ],
    [
      "Netherlands",
      new Map([
        [
          "nl-invoice",
          {
            name: "Invoice",
            value: nlInvoice as TemplateValue,
          },
        ],
      ]),
    ],
    [
      "Miscellaneous",
      new Map([
        [
          "misc-message",
          {
            name: "Message",
            value: message as TemplateValue,
          },
        ],
      ]),
    ],
  ]);

  function parsedTemplateJSON(value: unknown): string {
    return JSON.stringify(value, null, 4);
  }

  function handleTemplateClick(templateKey: string) {
    let template: Template | undefined;

    templateGroups.forEach((group) => {
      if (group.has(templateKey)) {
        template = group.get(templateKey);
      }
    });
    if (!template) {
      return;
    }

    editor.set(parsedTemplateJSON(template.value));
    envelope.set(null);
    dispatch("close");
  }

  let activeTab = "Templates";

  const tabs = new Set<{ title: string; onClick(): void; disabled: boolean }>([
    {
      title: "Templates",
      onClick: () => {
        // Not implemented yet.
      },
      disabled: false,
    },
    {
      title: "Upload",
      onClick: () => {
        // Not implemented yet.
      },
      disabled: true,
    },
    {
      title: "Library",
      onClick: () => {
        // Not implemented yet.
      },
      disabled: true,
    },
  ]);
</script>

<div class="font-medium text-center text-gray-500 border-b border-gray-200 mb-6 -mt-3">
  <ul class="flex flex-wrap -mb-px">
    {#each [...tabs] as tab}
      <li>
        <button
          class={classNames(
            "inline-block p-4 rounded-t-lg border-b-2 border-transparent",
            { "text-sky-500 border-b-2 border-sky-500": tab.title === activeTab },
            { "hover:text-gray-600 hover:border-gray-300": tab.title !== activeTab },
            { "cursor-not-allowed": tab.disabled }
          )}
          on:click={tab.onClick}
          >{tab.title}
        </button>
      </li>
    {/each}
  </ul>
</div>

{#each [...templateGroups] as [groupKey, group]}
  <div class="mb-6">
    <h3 class="uppercase font-semibold mb-3">{groupKey}</h3>
    <ul>
      {#each [...group] as [templateKey, template]}
        {#if template.value.$schema}
          <li>
            <button
              class="inline-flex gap-2 items-center hover:text-sky-500"
              on:click={() => handleTemplateClick(templateKey)}
            >
              <svelte:component this={schemaIconMap.get(template.value.$schema)} />
              {template.name}
            </button>
          </li>
        {/if}
      {/each}
    </ul>
  </div>
{/each}
