<script lang="ts">
  import type { UIModelRootField, UIModelField } from "$lib/editor/form/utils/model.js";
  import AbstractField from "./AbstractField.svelte";
  import SectionWrapper from "./SectionWrapper.svelte";
  import type { Schema } from "./utils/schema";

  export let field: UIModelRootField;
  export let readOnly = false;

  const emptyChildren: UIModelField[] = [];

  $: children = field.children?.filter((f) => f.key !== "$schema") || emptyChildren;
  // @todo: Add title field to schema object on gobl
  $: complexFields = children.filter((f) => {
    if ((f.schema.items as Schema)?.type === "string") {
      return false;
    }
    return ["array", "object"].includes(f.type);
  });
  $: simpleFields = children.filter((f) => {
    if ((f.schema.items as Schema)?.type === "string") {
      return true;
    }
    return !["array", "object"].includes(f.type);
  });
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
