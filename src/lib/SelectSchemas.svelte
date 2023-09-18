<script lang="ts">
  import Select from "svelte-select";
  import { createEventDispatcher, onMount } from "svelte";
  import { getSchemas } from "./editor/actions";

  const dispatch = createEventDispatcher();

  const GOBL_URL = "https://gobl.org/draft-0/";

  type ListOption = {
    value: string;
    label: string;
  };

  export let value: string = "";
  export let placeholder = "";
  export let allowAll = false;

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
</script>

<Select {placeholder} items={schemasList} searchable showChevron clearable={false} on:change={handleChange} {value} />
