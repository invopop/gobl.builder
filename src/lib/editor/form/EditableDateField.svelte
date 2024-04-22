<script lang="ts">
  import { DateInput } from "date-picker-svelte";
  import type { UIModelField } from "$lib/editor/form/utils/model.js";
  import clsx from "clsx";
  import { createEventDispatcher, onDestroy, onMount, tick } from "svelte";
  import { Icon } from "svelte-hero-icons";
  import { Calendar } from "@invopop/ui-icons";

  const uniqueId = `date-input-${Math.random().toString(36).slice(2, 7)}`;

  export let field: UIModelField<string>;
  export let showError = false;

  let input: HTMLInputElement | undefined;

  $: classes = clsx({
    [uniqueId]: true,
    "is-calculated": field.is.calculated,
    "has-error": showError,
  });

  $: date = new Date(field.value);

  const dispatch = createEventDispatcher();

  async function hanldeSelect() {
    await tick();

    if (!input) return;

    const value = input.value;

    if (value == field.value) return;

    dispatch("blur", value);
    dispatch("edit", value);
  }

  onMount(() => {
    input = document.querySelector(`.${uniqueId} > input`) as HTMLInputElement;

    if (!input) return;

    input.addEventListener("blur", hanldeSelect);
  });

  onDestroy(() => {
    if (!input) return;

    input.removeEventListener("blur", hanldeSelect);
  });
</script>

<div class="relative">
  <DateInput
    id={field.id}
    class={classes}
    value={date}
    closeOnSelection
    format="yyyy-MM-dd"
    placeholder="YYYY-MM-DD"
    on:select={hanldeSelect}
  />
  <Icon src={Calendar} class="w-4 h-4 text-neutral-500 absolute left-2 top-2" />
</div>

<style>
  :global(.date-time-field > input) {
    height: 32px;
    width: 100% !important;
    border: 1px solid #e9ebeb !important;
    border-radius: 4px !important;
    padding: 5px 28px !important;
    color: #0a0a0a !important;
    font-family: Inter;
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: 21.75px;
    letter-spacing: -0.135px;
    background-color: white !important;
  }

  :global(.date-time-field.is-calculated > input) {
    background-color: #fafbfb !important;
    color: #7e7f7f !important;
  }
  :global(.date-time-field > input:focus) {
    border: 1px solid #169958 !important;
    box-shadow: 0px 0px 0px 2px rgba(22, 153, 88, 0.12) !important;
  }
  :global(.date-time-field > input.invalid:focus, .date-time-field.has-error > input) {
    color: #ec4e46 !important;
    border: 1px solid #ec4e4666 !important;
  }
</style>
