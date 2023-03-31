<script lang="ts">
  import type { UIModel } from "$lib/editor/form/utils/schema.js";
  import AddFieldMenu from "./AddFieldMenu.svelte";
  import AbstractField from "./AbstractField.svelte";

  export let field: UIModel;
  $: childs = Object.entries(field.children || {});
</script>

<div class="p-2 relative">
  {#each childs as [k, field] (k)}
    <AbstractField {field} />
  {/each}
  <AddFieldMenu {field} />
</div>
