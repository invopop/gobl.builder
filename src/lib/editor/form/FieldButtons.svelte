<script lang="ts">
  import { fade } from "svelte/transition";
  import { Trash, DocumentDuplicate, ArrowUp, ArrowDown, Plus, Minus } from "svelte-hero-icons";
  import { createEventDispatcher } from "svelte";
  import type { UIModelField } from "./utils/model.js";
  import FieldButton from "./FieldButton.svelte";

  export let field: UIModelField | undefined = undefined;
  export let showAdd = true;
  export let canMoveUp = false;
  export let canMoveDown = false;

  const dispatch = createEventDispatcher();

  $: classes = field?.is.calculated ? "bg-blue-100" : "bg-color2";
</script>

<div id="fieldBackground" class="flex w-full h-full rounded {classes}" transition:fade={{ duration: 200 }}>
  <div class="flex-shrink-0 left-full h-9 ml-1 top-0 rounded {classes}">
    <ul class="flex align-middle text-grey-5 h-full">
      {#if showAdd}
        <li>
          <FieldButton icon={Plus} tooltipText="Add field" on:click={() => dispatch("add")} />
        </li>
      {/if}
      {#if field?.is.duplicable}
        <li>
          <FieldButton icon={DocumentDuplicate} tooltipText="Duplicate" on:click={() => dispatch("duplicate")} />
        </li>
      {/if}
      {#if field?.is.disposable}
        <li>
          <FieldButton
            icon={Minus}
            confirmationIcon={Trash}
            tooltipText="Remove"
            isDestructive={true}
            on:click={() => dispatch("remove")}
          />
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
    </ul>
  </div>
</div>
