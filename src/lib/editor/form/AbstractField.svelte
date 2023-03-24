<script lang="ts">
  import type { UIModelField } from "$lib/schema.js";
  import type { SvelteComponent } from "svelte";
  import ObjectField from "./ObjectField.svelte";
  import ArrayField from "./ArrayField.svelte";
  import StringField from "./StringField.svelte";
  import FallbackField from "./FallbackField.svelte";

  export let field: UIModelField;

  const componentsMap: Record<string, typeof SvelteComponent> = {
    object: ObjectField,
    array: ArrayField,
    string: StringField,
  };
</script>

<div class="my-2">
  <svelte:component this={componentsMap[field.type] || FallbackField} {field} />
</div>
