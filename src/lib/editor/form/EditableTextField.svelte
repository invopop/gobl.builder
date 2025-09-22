<script lang="ts">
  import { run, createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import SelectSchemas from "$lib/SelectSchemas.svelte";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import { getBuilderContext } from "$lib/store/builder";
  import clsx from "clsx";
  import { createEventDispatcher } from "svelte";

  interface Props {
    field: UIModelField<string>;
    showError?: boolean;
    classes?: string;
    value?: string;
    id?: string;
  }

  let {
    field,
    showError = false,
    classes = $bindable(""),
    value = "",
    id = ""
  }: Props = $props();

  let iid = $derived(id || field.id);
  let val = $derived(value || field.value);
  let fieldType = $derived(Array.isArray(field.schema.type) ? field.schema.type[0] : field.schema.type || "");
  run(() => {
    classes = clsx({
      "bg-neutral-50 border-slate-100 text-neutral-500": field.is.calculated,
      "text-neutral-800": !field.is.calculated && !showError,
      "border-danger-200 focus:border-danger-200 text-danger-500": showError,
      "text-right tabular-nums slashed-zero": ["number", "integer"].includes(fieldType),
    });
  });

  const builderContext = getBuilderContext();

  const { recreateEditor } = builderContext;

  const dispatch = createEventDispatcher();

  function handleBlur(e: FocusEvent) {
    const input = e.target as HTMLDivElement;
    const value = input.innerText.trim();
    dispatch("edit", value);
    dispatch("blur", value);
  }

  function handleSchemaChange(event: CustomEvent) {
    field.setValue(event.detail);
    const value = field.root.toJSON();
    builderContext.editor.set({ value, updatedAt: Date.now() });
    recreateEditor();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== "Enter") return;

    if (e.shiftKey) {
      e.stopPropagation();
      return;
    }

    e.preventDefault();
  }

  function handlePaste(event: Event) {
    event.preventDefault();
    let clipboardEvent = event as ClipboardEvent;

    if (!clipboardEvent.clipboardData) return;

    const target = event.target as HTMLDivElement;

    if (!target) return;

    const pasteText = clipboardEvent.clipboardData.getData("text/plain");
    const selection = window.getSelection();

    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(pasteText);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
</script>

{#if field.schema.title === "$schema"}
  <SelectSchemas placeholder="Select a $schema..." on:change={handleSchemaChange} value={val} />
{:else}
  <div
    role="textbox"
    tabindex="0"
    contenteditable
    id={iid}
    onblur={handleBlur}
    onkeydown={handleKeydown}
    onpaste={handlePaste}
    onfocus={bubble('focus')}
    class="{classes} focus:border-workspace-accent-500 border cursor-text text-base rounded px-3 py-[5px] outline-none w-full caret-workspace-accent-500 tracking-tight focus:shadow-active"
  >
    {val}
  </div>
{/if}
