<script lang="ts">
  import type { UIModelRootField, UIModelField } from "$lib/editor/form/utils/model.js";
  import AbstractField from "./AbstractField.svelte";
  import SectionWrapper from "./SectionWrapper.svelte";
  import type { Schema } from "./utils/schema";

  interface Props {
    field: UIModelRootField;
    readOnly?: boolean;
  }

  let { field, readOnly = false }: Props = $props();

  const emptyChildren: UIModelField[] = [];

  let children = $derived(field.children?.filter((f) => f.key !== "$schema") || emptyChildren);
  // @todo: Add title field to schema object on gobl
  let complexFields = $derived(children.filter((f) => {
    if ((f.schema.items as Schema)?.type === "string") {
      return false;
    }
    return ["array", "object"].includes(f.type);
  }));
  let simpleFields = $derived(children.filter((f) => {
    if ((f.schema.items as Schema)?.type === "string") {
      return true;
    }
    return !["array", "object"].includes(f.type);
  }));
</script>

<SectionWrapper {readOnly} {field}>
  {#each simpleFields as field (field.id)}
    <AbstractField
      {field}
      {readOnly}
      on:fieldAdded
      on:fieldDeleted
      on:fieldDuplicated
      on:fieldMoved
      on:fieldValueUpdated
      on:fieldKeyUpdated
    />
  {/each}

  <!-- @migration-task: migrate this slot by hand, `extra-content` is an invalid identifier -->
  <!-- @migration-task: migrate this slot by hand, `extra-content` is an invalid identifier -->
  <div slot="extra-content">
    {#each complexFields as field (field.id)}
      <AbstractField
        {field}
        {readOnly}
        on:fieldAdded
        on:fieldDeleted
        on:fieldDuplicated
        on:fieldMoved
        on:fieldValueUpdated
        on:fieldKeyUpdated
      />
    {/each}
  </div>
</SectionWrapper>
