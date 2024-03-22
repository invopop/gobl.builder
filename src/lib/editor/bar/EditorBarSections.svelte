<script lang="ts">
  import { getBuilderContext } from "$lib/store/builder";
  import type { DocumentHeader } from "$lib/types/editor";

  const builderContext = getBuilderContext();

  const { activeSection, documentHeaders } = builderContext;

  function setActive(header: DocumentHeader) {
    $activeSection = {
      section: header.slug,
      scroll: true,
    };
  }
</script>

{#if $documentHeaders.length && !$documentHeaders[0].slug.includes("root")}
  <ul class="flex items-center space-x-5 h-full">
    {#each $documentHeaders as header}
      <li
        class:font-medium={$activeSection.section === header.slug}
        class:text-neutral-800={$activeSection.section === header.slug}
        class:text-neutral-400={$activeSection.section !== header.slug}
        class="text-base whitespace-nowrap relative"
      >
        <button
          on:click={() => {
            setActive(header);
          }}
          class="tracking-normal"
        >
          {header.label}
        </button>
        {#if $activeSection.section === header.slug}
          <div class="border-b absolute bottom-[-14px] border-black w-full z-20"></div>
        {/if}
      </li>
    {/each}
  </ul>
{/if}
