<script module lang="ts">
  import type { SvelteComponent } from "svelte";

  import InvoiceIcon from "./InvoiceIcon.svelte";
  import MessageIcon from "./MessageIcon.svelte";

  export const schemaIconMap = new Map<string, typeof SvelteComponent>([
    ["https://gobl.org/draft-0/bill/invoice", InvoiceIcon],
    ["https://gobl.org/draft-0/note/message", MessageIcon],
  ] as [string, typeof SvelteComponent][]);

  export const schemaIconFor = (schema: string): typeof SvelteComponent => {
    const icon = schemaIconMap.get(schema);
    if (!icon) {
      return MessageIcon as typeof SvelteComponent; // default
    }
    return icon;
  };
</script>
