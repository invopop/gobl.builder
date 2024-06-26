<script lang="ts">
  import Select from "svelte-select";
  import { createEventDispatcher, onMount } from "svelte";
  import { getSchemas } from "./editor/actions";
  import type { ListOption } from "./types/ui";

  const dispatch = createEventDispatcher();

  const GOBL_URL = "https://gobl.org/draft-0/";

  export let value: string = "";
  export let placeholder = "";
  export let allowAll = false;
  export let navBar = false;

  let schemasList: ListOption[] = [];

  function handleChange(e: CustomEvent) {
    value = e.detail.label;
    dispatch("change", e.detail.value);
  }

  onMount(async () => {
    const schemas = await getSchemas();
    schemasList = schemas.map((s: string) => ({
      value: s,
      label: s.replace(GOBL_URL, ""),
    }));

    if (allowAll) {
      schemasList.unshift({
        value: "",
        label: "All",
      });
    }
  });

  $: border = navBar ? "1px #4C515A solid" : "1px #E9EBEF solid";
  $: placeholderColor = navBar ? "#FBFBFC" : "#030712";
</script>

<Select
  --height="32px"
  --chevron-height="32px"
  --background="rgba(255, 255, 255, 0.05)"
  --border-radius="4px"
  --border={border}
  --border-focused="1px #15C6F6 solid"
  --selected-item-color={placeholderColor}
  --placeholder-color={placeholderColor}
  --font-size="15px"
  --list-background="#212936"
  --list-border="1px #4C515A solid"
  --list-border-radius="4px"
  --item-color="#FBFBFC"
  --item-first-border-radius="4px"
  --item-hover-bg="rgba(255, 255, 255, 0.1)"
  --item-hover-color="#FBFBFC"
  --list-z-index="100"
  {placeholder}
  items={schemasList}
  searchable
  showChevron
  clearable={false}
  on:change={handleChange}
  {value}
>
  <div slot="chevron-icon">
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10.5" cy="10" r="8" fill={navBar ? "white" : "grey"} fill-opacity="0.1" />
      <path d="M7 8.25004L10.5 11.75L14 8.25" stroke={navBar ? "white" : "black"} stroke-width="1.2" />
    </svg>
  </div>
</Select>

<style>
  :global(.list-item .item) {
    border-radius: 4px;
  }
  :global(.svelte-select-list) {
    padding: 3px;
  }
</style>
