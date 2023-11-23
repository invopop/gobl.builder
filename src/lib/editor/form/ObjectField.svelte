<script lang="ts">
  import type { UIModelField, UIModelRootField } from "$lib/editor/form/utils/model.js";
  import { createEventDispatcher } from "svelte";
  import AbstractField from "./AbstractField.svelte";
  import RootField from "./RootField.svelte";
  import SectionWrapper from "./SectionWrapper.svelte";

  const dispatch = createEventDispatcher();

  export let field: UIModelField;
  export let readOnly = false;

  let highlight = false;

  $: children = field.children || ([] as UIModelField[]);

  function handleHoverChild(e: CustomEvent) {
    highlight = e.detail;
    dispatch("hoverChild", e.detail);
  }

  interface PropsInterface {
    field: UIModelRootField;
  }

  $: props = $$props as PropsInterface;
</script>

{#if field.is.root}
  <RootField
    {...props}
    {readOnly}
    on:fieldAdded
    on:fieldDeleted
    on:fieldDuplicated
    on:fieldMoved
    on:fieldValueUpdated
    on:fieldKeyUpdated
  />
{:else}
  <SectionWrapper {field} {highlight}>
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
        on:hoverChild={handleHoverChild}
      />
    {/each}
  </SectionWrapper>
{/if}
