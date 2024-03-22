<script lang="ts">
  import { Trash, DocumentDuplicate, ArrowUp, ArrowDown, Plus } from "svelte-hero-icons";
  import { createEventDispatcher } from "svelte";
  import type { UIModelField } from "./utils/model.js";
  import FieldButton from "./FieldButton.svelte";
  import { Options } from "@invopop/ui-icons";

  export let field: UIModelField | undefined = undefined;

  const dispatch = createEventDispatcher();

  $: showAdd = ["object", "array"].includes(field?.type || "");
  $: addLabel = field?.type === "array" ? "Add Row" : "Add Property";
  $: canMove = field?.parent?.type === "array";
  $: canMoveUp = canMove && Number(field?.key) > 0;
  $: canMoveDown = canMove && Number(field?.key) < Number(field?.parent?.children?.length) - 1;
</script>

<ul
  style="box-shadow: 0px 8px 30px 0px rgba(10, 10, 10, 0.12)"
  class="flex space-x-2 rounded-md border border-neutral-200 py-1 px-[5px] bg-white"
>
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
  <li>
    <FieldButton icon={Options} disabled />
  </li>
</ul>
