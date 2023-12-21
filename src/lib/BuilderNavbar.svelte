<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import { envelope, envelopeIsSigned } from "$lib/editor/stores.js";
  import { createEventDispatcher, onMount } from "svelte";
  import { getSchemas } from "./editor/actions";
  import DocLoader from "../components/DocLoader.svelte";
  import logo from "../static/logo-light.svg";
  import type { ListOption } from "./types/ui";
  import BuilderNavbarItem from "./ui/BuilderNavbarItem.svelte";
  import clickOutside from "./clickOutside";
  import type { State } from "./types/editor";
  import EnvelopeHeader from "./menubar/EnvelopeHeader.svelte";
  import EnvelopeSignatures from "./menubar/EnvelopeSignatures.svelte";
  import Modal from "$lib/ui/Modal.svelte";
  import BaseButton from "./ui/BaseButton.svelte";
  import ExportDoc from "./actions/ExportDoc.svelte";
  import { iconButtonClasses } from "./ui/iconButtonClasses";
  import CorrectIcon from "./ui/icons/CorrectIcon.svelte";

  const dispatch = createEventDispatcher();

  const GOBL_URL = "https://gobl.org/draft-0/";

  export let defaultSchema = "";
  export let editorView = "form";
  export let forceReadOnly = false;
  export let state: State = "init";

  let openModal = false;
  let modalComponent: typeof SvelteComponent | null = null;
  let modalTitle = "";
  let mobileMenuOpen = false;
  let activeSection: string | null = null;
  let schemasList: ListOption[] = [];

  $: selectedSchema = schemasList.find((s) => s.value === defaultSchema);

  function handleHeaderClick() {
    openModal = true;
    modalComponent = EnvelopeHeader as typeof SvelteComponent;
    modalTitle = "Header";
  }

  function handleSigsClick() {
    if (!$envelopeIsSigned) {
      return;
    }

    openModal = true;
    modalComponent = EnvelopeSignatures as typeof SvelteComponent;
    modalTitle = "Signatures";
  }

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

<nav class="navbar" aria-label="main navigation">
  <div class="navbar-brand">
    <a class="navbar-item" href="https://gobl.org">
      <img src={logo} class="w-8 h-8" alt="GOBL logo" title="GOBL Builder" />
    </a>

    <button
      class:is-active={mobileMenuOpen}
      on:click={() => {
        mobileMenuOpen = !mobileMenuOpen;
      }}
      class="navbar-burger"
      aria-label="menu"
      aria-expanded={mobileMenuOpen}
    >
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>
  </div>

  <div class:is-active={mobileMenuOpen} class="navbar-menu">
    <div
      class="navbar-start"
      use:clickOutside
      on:close={() => {
        activeSection = null;
      }}
    >
      <button
        on:mouseenter={() => {
          activeSection = null;
        }}
      >
        <DocLoader on:load />
      </button>

      <div class="navbar-item has-dropdown" class:is-active={activeSection === "schemas"}>
        <button
          class="navbar-link space-x-1"
          on:mouseenter={() => {
            activeSection = "schemas";
          }}
        >
          <span>Schema</span>
          {#if selectedSchema}
            <span>({selectedSchema.label})</span>
          {/if}
        </button>

        <ul class:max-h-96={!mobileMenuOpen} class="navbar-dropdown overflow-auto">
          {#each schemasList as schema}
            <BuilderNavbarItem
              option={schema}
              isActive={schema.value === defaultSchema}
              on:click={() => {
                defaultSchema = schema.value;
                dispatch("schemaChanged", schema.value);
                activeSection = null;
              }}
            />
          {/each}
        </ul>
      </div>

      <div class="navbar-item has-dropdown" class:is-active={activeSection === "options"}>
        <button
          class="navbar-link"
          on:mouseenter={() => {
            activeSection = "options";
          }}
        >
          Options
        </button>

        <ul class="navbar-dropdown">
          <BuilderNavbarItem
            option={{ value: "form", label: "Form View" }}
            isActive={editorView === "form"}
            on:click={() => {
              editorView = "form";
            }}
          />
          <BuilderNavbarItem
            option={{ value: "code", label: "Code View" }}
            isActive={editorView === "code"}
            on:click={() => {
              editorView = "code";
            }}
          />
          <BuilderNavbarItem
            option={{ value: "readonly", label: "Read Only" }}
            isActive={forceReadOnly}
            on:click={() => {
              forceReadOnly = !forceReadOnly;
            }}
          />
        </ul>
      </div>

      <div class="navbar-item has-dropdown" class:is-active={activeSection === "actions"}>
        <button
          class="navbar-link"
          on:mouseenter={() => {
            activeSection = "actions";
          }}
        >
          Document Actions
        </button>

        <ul class="navbar-dropdown">
          <BuilderNavbarItem
            option={{ value: "build", label: "Build" }}
            disabled={state !== "modified" && state !== "loaded"}
            on:click={(event) => {
              activeSection = null;
              dispatch("action", event.detail.value);
            }}
          />
          <BuilderNavbarItem
            option={{ value: "correct", label: "Correct" }}
            disabled={!["built", "loaded", "signed", "modified"].includes(state)}
            on:click={(event) => {
              activeSection = null;
              dispatch("action", event.detail.value);
            }}
          />
          <BuilderNavbarItem
            option={{ value: "sign", label: "Sign" }}
            disabled={state !== "built"}
            on:click={(event) => {
              activeSection = null;
              dispatch("action", event.detail.value);
            }}
          />
          <BuilderNavbarItem
            option={{ value: "validate", label: "Validate" }}
            disabled={state === "errored" || state !== "signed"}
            on:click={(event) => {
              activeSection = null;
              dispatch("action", event.detail.value);
            }}
          />
        </ul>
      </div>

      {#if $envelope}
        <div class="navbar-item has-dropdown" class:is-active={activeSection === "info"}>
          <button
            class="navbar-link"
            on:mouseenter={() => {
              activeSection = "info";
            }}
          >
            Envelope Info
          </button>

          <ul class="navbar-dropdown">
            <BuilderNavbarItem option={{ value: "headers", label: "View Headers" }} on:click={handleHeaderClick} />
            <BuilderNavbarItem
              option={{ value: "signatures", label: "View Signatures" }}
              disabled={!$envelopeIsSigned}
              on:click={handleSigsClick}
            />
          </ul>
        </div>
      {/if}
    </div>

    <div class="navbar-end">
      <div class="flex md:space-x-1 items-center justify-center">
        <button
          title={state === "modified" || state === "loaded"
            ? "Build the GOBL document."
            : "To build, first ensure the document is valid."}
          class={iconButtonClasses(state !== "modified" && state !== "loaded")}
          on:click={() => {
            dispatch("action", "build");
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <button
          title="Correct document."
          on:click={() => {
            dispatch("action", "correct");
          }}
          class={iconButtonClasses(!["built", "loaded", "signed", "modified"].includes(state))}
        >
          <CorrectIcon />
        </button>
        <button
          title="Sign document."
          on:click={() => {
            dispatch("action", "sign");
          }}
          class={iconButtonClasses(state !== "built")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path
              fill-rule="evenodd"
              d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <button
          title="Validate a signed GOBL document."
          on:click={() => {
            dispatch("action", "validate");
          }}
          class={iconButtonClasses(state === "errored" || state !== "signed")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <ExportDoc />
        <div class="flex text-gray-700 space-x-2 items-center justify-center pr-4 w-20 text-right">
          <span class="text-xs">{state}</span>
        </div>
      </div>
    </div>
  </div>
</nav>
{#if openModal}
  <div>
    <div class="bg-black bg-opacity-70 fixed inset-0 z-40" />
    <Modal title={modalTitle} on:close={() => (openModal = false)}>
      <svelte:component this={modalComponent} />
      <BaseButton
        slot="footer"
        on:click={() => {
          openModal = false;
        }}
      >
        Cancel
      </BaseButton>
    </Modal>
  </div>
{/if}
