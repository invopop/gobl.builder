<script lang="ts">
  import type { UIModelField, UIModelRootField } from "$lib/editor/form/utils/model.js";
  import AbstractField from "./AbstractField.svelte";
  import RootField from "./RootField.svelte";
  import SectionWrapper from "./SectionWrapper.svelte";

  export let field: UIModelField;
  export let readOnly = false;
  export let isActive = false;

  $: children = field.children || ([] as UIModelField[]);

  interface PropsInterface {
    field: UIModelRootField;
  }

  $: props = $$props as PropsInterface;
</script>

{#if field.is.root}
  <RootField
    {...props}
    {readOnly}
    {isActive}
    on:fieldAdded
    on:fieldDeleted
    on:fieldDuplicated
    on:fieldMoved
    on:fieldValueUpdated
    on:fieldKeyUpdated
  />
{:else}
  <SectionWrapper {field} {isActive}>
    {#each children as childField (childField.id)}
      <AbstractField
        field={childField}
        {readOnly}
        on:fieldAdded
        on:fieldDeleted
        on:fieldDuplicated
        on:fieldMoved
        on:fieldValueUpdated
        on:fieldKeyUpdated
      />
    {/each}
  </SectionWrapper>
{/if}
