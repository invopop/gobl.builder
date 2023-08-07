<script context="module" lang="ts">
  import type { SvelteComponent } from "svelte";

  import InvoiceIcon from "./icons/InvoiceIcon.svelte";
  import MessageIcon from "./icons/MessageIcon.svelte";

  export const schemaIconMap = new Map<string, typeof SvelteComponent>([
    ["https://gobl.org/draft-0/bill/invoice", InvoiceIcon],
    ["https://gobl.org/draft-0/note/message", MessageIcon],
  ]);

  export const schemaIconFor = (schema: string): typeof SvelteComponent => {
    const icon = schemaIconMap.get(schema);
    if (!icon) {
      return MessageIcon; // default
    }
    return icon;
  };
</script>
