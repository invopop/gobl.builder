<script lang="ts">
  import { Trash, DocumentDuplicate, ArrowUp, ArrowDown, Plus } from "svelte-hero-icons";
  import { createEventDispatcher } from "svelte";
  import type { UIModelField } from "./utils/model.js";
  import FieldButton from "./FieldButton.svelte";

  export let field: UIModelField | undefined = undefined;

  const dispatch = createEventDispatcher();

  $: showAdd = ["object", "array"].includes(field?.type || "");
  $: addLabel = field?.type === "array" ? "Add Row" : "Add Property";
  $: canMove = field?.parent?.type === "array";
  $: canMoveUp = canMove && Number(field?.key) > 0;
  $: canMoveDown = canMove && Number(field?.key) < Number(field?.parent?.children?.length) - 1;
</script>

<ul class="flex space-x-2 rounded border border-neutral-200 p-1">
  {#if showAdd}
    <li>
      <FieldButton icon={Plus} tooltipText={addLabel} on:click={() => dispatch("add")} />
    </li>
  {/if}
  {#if field?.is.duplicable}
    <li>
      <FieldButton icon={DocumentDuplicate} tooltipText="Duplicate" on:click={() => dispatch("duplicate")} />
    </li>
  {/if}
  {#if canMoveUp}
    <li>
      <FieldButton icon={ArrowUp} tooltipText="Move Up" on:click={() => dispatch("moveUp")} />
    </li>
  {/if}
  {#if canMoveDown}
    <li>
      <FieldButton icon={ArrowDown} tooltipText="Move Down" on:click={() => dispatch("moveDown")} />
    </li>
  {/if}
  {#if field?.is.disposable}
    <li>
      <FieldButton
        icon={Trash}
        confirmationIcon={Trash}
        tooltipText="Remove"
        isDestructive={true}
        on:click={() => dispatch("remove")}
      />
    </li>
  {/if}
</ul>
