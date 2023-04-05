<script lang="ts">
  import type { UIModelRootField, UIModelField } from "$lib/editor/form/utils/model.js";
  import AddFieldMenu from "./AddFieldMenu.svelte";
  import AbstractField from "./AbstractField.svelte";

  export let field: UIModelRootField;
  $: childs = field.children || ([] as UIModelField[]);
</script>

{#each childs as field (field.key)}
  <AbstractField {field} />
{/each}
<AddFieldMenu {field} />
