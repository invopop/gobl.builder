<script context="module" lang="ts">
  import type { SvelteComponent } from "svelte";

  import InvoiceIcon from "./ui/InvoiceIcon.svelte";
  import MessageIcon from "./ui/MessageIcon.svelte";

  export const schemaIconMap = new Map<string, typeof SvelteComponent>([
    ["https://gobl.org/draft-0/bill/invoice", InvoiceIcon],
    ["https://gobl.org/draft-0/note/message", MessageIcon],
  ]);
</script>
