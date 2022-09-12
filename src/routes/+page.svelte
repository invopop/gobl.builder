<script lang="ts">
  import GOBLBuilder from "$lib/GOBLBuilder.svelte";

  // TODO: Refactor the "Load template..." button and related modal and template
  // loading logic out of the `GOBLBuilder` library, and into the demo wrapper.
  // After that is done, we can make `jsonSchemaURL` dynamic, based on what kind
  // of document is being loaded.
  const jsonSchemaURL = "https://gobl.org/draft-0/bill/invoice";
</script>

<div class="h-screen">
  <GOBLBuilder {jsonSchemaURL} />
</div>
