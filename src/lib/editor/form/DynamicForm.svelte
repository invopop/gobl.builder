<script lang="ts">
  import { clsx } from "clsx";

  import SchemaField from "./SchemaField.svelte";
  import AbstractField from "./AbstractField.svelte";
  import type { UIModelRootField, UIModelField } from "./utils/model";
  import { afterUpdate, createEventDispatcher, getContext, onDestroy, onMount } from "svelte";
  import type { Writable } from "svelte/store";
  import { getBuilderContext } from "$lib/store/builder";

  const dispatch = createEventDispatcher();

  const { scrollingSection } = getBuilderContext();

  const scrollPosition = getContext("scrollPosition") as Writable<number>;

  let formElement: HTMLElement;

  export let showSchemaField = false;
  export let isEmptySchema = false;
  export let model: UIModelRootField | UIModelField | undefined = undefined;
  export let readOnly = false;
  export let modal = false;

  $: wrapperClasses = clsx({
    "pt-5 pb-40": !modal,
  });

  $: classes = clsx({
    "w-[500px]": modal,
    "w-full max-w-[632px]": !modal,
  });

  const handleScroll = () => {
    $scrollPosition = formElement.scrollTop;
  };

  onMount(() => {
    formElement.addEventListener("scroll", handleScroll);
  });

  afterUpdate(() => {
    if ($scrollingSection) return;

    formElement.scrollTo(0, $scrollPosition);
  });

  onDestroy(() => {
    formElement.removeEventListener("scroll", handleScroll);
  });
</script>

<div bind:this={formElement} class="h-full overflow-y-auto overflow-x-hidden hideScroll">
  <div class="{wrapperClasses} flex editor-wrapper">
    <div class={classes}>
      {#if showSchemaField}
        <SchemaField {isEmptySchema} />
      {:else if model}
        <AbstractField
          field={model}
          {readOnly}
          on:fieldAdded={(event) => {
            dispatch("uiRefreshNeeded", model);
            dispatch("fieldAdded", event);
          }}
          on:fieldDeleted={(event) => {
            dispatch("uiRefreshNeeded", model);
            dispatch("fieldDeleted", event);
          }}
          on:fieldDuplicated={(event) => {
            dispatch("uiRefreshNeeded", model);
            dispatch("fieldDuplicated", event);
          }}
          on:fieldMoved={(event) => {
            dispatch("uiRefreshNeeded", model);
            dispatch("fieldMoved", event);
          }}
          on:fieldValueUpdated
          on:fieldKeyUpdated
        />
      {/if}
    </div>
  </div>
</div>

<style>
  .editor-wrapper {
    justify-content: var(--editor-justify-content, center);
    padding-left: 40px;
    padding-right: 40px;
  }
  @media (min-width: 768px) {
    .editor-wrapper {
      padding-left: calc(var(--editor-padding-left, 54px) - 20px);
    }
  }
</style>
