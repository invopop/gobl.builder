<script lang="ts">
  import esInvoice from "./templates/es/invoice.json";
  import esInvoiceRevCharge from "./templates/es/invoice-rev-charge.json";
  import esInvoiceFreelance from "./templates/es/invoice-freelance.json";
  import nlInvoice from "./templates/nl/invoice.json";

  import message from "./templates/misc/message.json";

  import { editor } from "./stores";

  type Template = {
    name: string;
    value: Record<string, any>;
  };

  const templateGroups: Map<string, Map<string, Template>> = new Map([
    [
      "Spain",
      new Map([
        [
          "es-invoice",
          {
            name: "Invoice",
            value: esInvoice as unknown,
          },
        ],
        [
          "es-invoice-rev-charge",
          {
            name: "Invoice (reverse charge)",
            value: esInvoiceRevCharge as unknown,
          },
        ],
        [
          "es-invoice-freelance",
          {
            name: "Invoice (freelance)",
            value: esInvoiceFreelance as unknown,
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
            value: nlInvoice as unknown,
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
            value: message as unknown,
          },
        ],
      ]),
    ],
  ]);

  let selectedId = "";

  function parsedTemplateJSON(value: unknown): string {
    return JSON.stringify(value, null, 4);
  }

  function handleTemplatePick(event) {
    selectedId = event.target.value;
    let template: Template;
    templateGroups.forEach((group) => {
      if (group.has(event.target.value)) {
        template = group.get(event.target.value);
      }
    });
    if (!template) {
      return;
    }
    editor.set(parsedTemplateJSON(template.value));
  }

  editor.subscribe((value) => {
    // If the current editor contents matches a template, set this template as
    // selected.
    for (const [_, templates] of [...templateGroups]) {
      for (const [key, template] of [...templates]) {
        if (value === parsedTemplateJSON(template.value)) {
          selectedId = key;
          return;
        }
      }
    }
    selectedId = "";
  });
</script>

<select class="form-select border-gray-300 border rounded-lg text-sm shadow-sm" on:change={handleTemplatePick}>
  <option value="" selected={selectedId === ""}>Choose a template</option>
  {#each [...templateGroups] as [groupKey, group]}
    <optgroup label={groupKey}>
      {#each [...group] as [templateKey, template]}
        <option value={templateKey} selected={selectedId === templateKey}>{template.name}</option>
      {/each}
    </optgroup>
  {/each}
</select>
