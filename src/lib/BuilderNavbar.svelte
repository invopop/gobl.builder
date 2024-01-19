<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { getSchemas } from "./editor/actions";
  import DocLoader from "../components/DocLoader.svelte";
  import logo from "../static/logo-name.svg";
  import type { ListOption } from "./types/ui";
  import type { State } from "./types/editor";
  import SelectSchemas from "./SelectSchemas.svelte";
  import BuilderNavbarViews from "./BuilderNavbarViews.svelte";
  import BuilderNavbarOptions from "./BuilderNavbarOptions.svelte";
  import BuilderNavbarActions from "./BuilderNavbarActions.svelte";
  import BuilderNavbarEnvelopeMeta from "./BuilderNavbarEnvelopeMeta.svelte";
  import BuilderNavbarSeparator from "./BuilderNavbarSeparator.svelte";
  import { Icon } from "@steeze-ui/svelte-icon";
  import { Menu, Close } from "@invopop/ui-icons";
  import { envelope } from "./editor/stores";
  import BuilderNavbarDownload from "./BuilderNavbarDownload.svelte";

  const dispatch = createEventDispatcher();

  const GOBL_URL = "https://gobl.org/draft-0/";

  export let defaultSchema = "";
  export let editorView = "form";
  export let forceReadOnly = false;
  export let state: State = "init";

  let mobileMenuOpen = false;
  let schemasList: ListOption[] = [];

  onMount(async () => {
    const schemas = await getSchemas();
    schemasList = schemas.map((s: string) => ({
      value: s,
      label: s.replace(GOBL_URL, ""),
    }));

    schemasList.unshift({
      value: "",
      label: "All",
    });
  });
</script>

<nav
  class="fixed w-full z-50 h-14 flex items-center justify-between bg-background-500 py-2 px-5 space-x-1"
  aria-label="main navigation"
>
  <div class="flex items-center">
    <a href="https://gobl.org">
      <img src={logo} class="h-6" alt="GOBL logo" title="GOBL Builder" />
    </a>

    <div class="hidden md:block mx-3">
      <BuilderNavbarSeparator />
    </div>

    <div class="hidden md:block">
      <DocLoader on:load />
    </div>

    <div class="hidden md:block lg:w-[256px] ml-3">
      <SelectSchemas
        navBar
        bind:value={defaultSchema}
        placeholder="Schema"
        on:change={(event) => {
          dispatch("schemaChanged", event.detail);
        }}
      />
    </div>
  </div>

  <div class="hidden md:flex items-center space-x-3">
    <BuilderNavbarOptions bind:forceReadOnly />

    {#if $envelope?.doc}
      <BuilderNavbarSeparator />
      <BuilderNavbarEnvelopeMeta on:action />
    {/if}

    <BuilderNavbarSeparator />

    <BuilderNavbarViews bind:editorView />
    <BuilderNavbarSeparator />

    <BuilderNavbarActions {state} on:action />

    <BuilderNavbarSeparator />

    <BuilderNavbarDownload on:action />
  </div>
  <button
    class="md:hidden p-1.5 border border-neutral-300"
    on:click={() => {
      mobileMenuOpen = !mobileMenuOpen;
    }}
  >
    {#if mobileMenuOpen}
      <Icon src={Close} class="w-5 h-5 text-white" />
    {:else}
      <Icon src={Menu} class="w-5 h-5 text-white" />
    {/if}
  </button>
</nav>
{#if mobileMenuOpen}
  <div class="absolute md:hidden mt-14 bg-background-500 inset-0 z-10 px-3 py-2">
    <div class="flex">
      <DocLoader
        on:load={(event) => {
          mobileMenuOpen = false;
          dispatch("load", event.detail);
        }}
      />
      <div class="w-full ml-3">
        <SelectSchemas
          navBar
          bind:value={defaultSchema}
          placeholder="Schema"
          on:change={(event) => {
            dispatch("schemaChanged", event.detail);
          }}
        />
      </div>
    </div>
    <hr class="my-5 border-neutral-300" />
    <BuilderNavbarViews bind:editorView />
    <hr class="my-5 border-neutral-300" />
    <BuilderNavbarOptions bind:forceReadOnly />
    <hr class="my-5 border-neutral-300" />
    <BuilderNavbarEnvelopeMeta on:action />
    <hr class="my-5 border-neutral-300" />
    <div class="flex items-center space-x-3">
      <BuilderNavbarActions
        {state}
        on:action={(event) => {
          mobileMenuOpen = false;
          dispatch("action", event.detail);
        }}
      />
      <BuilderNavbarSeparator />
      <BuilderNavbarDownload on:action />
    </div>
  </div>
{/if}
