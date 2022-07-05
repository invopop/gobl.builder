<script lang="ts">
  import invoice from "./templates/invoice.json";
  import { editor } from "./stores";

  type Template = {
    name: string;
    value: Record<string, unknown>;
  };

  const templates: Map<string, Template> = new Map([
    [
      "invoice",
      {
        name: "Invoice",
        value: invoice,
      },
    ],
  ]);

  let selectedId = "";

  function parsedTemplateJSON(value: unknown): string {
    return JSON.stringify(value, null, 4);
  }

  function handleTemplatePick(event) {
    selectedId = event.target.value;
    const template = templates.get(event.target.value);
    if (!template) {
      return;
    }
    editor.set(parsedTemplateJSON(template.value));
  }

  editor.subscribe((value) => {
    // If the current editor contents matches a template, set this template as
    // selected.
    templates.forEach((template, key) => {
      selectedId = value === parsedTemplateJSON(template.value) ? key : "";
    });
  });
</script>

<select class="form-select border-gray-300 border rounded-lg text-sm shadow-sm" on:change={handleTemplatePick}>
  <option value="" selected={selectedId === ""}>Pick a template...</option>
  {#each [...templates] as [key, template]}
    <option value={key} selected={selectedId === key}>{template.name}</option>
  {/each}
</select>
