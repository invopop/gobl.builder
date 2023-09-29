<script lang="ts">
  import "flag-icons/css/flag-icons.min.css";
  import templateGroups from "./templateData";
  export let regime = "Spain";
  let open = false;

  $: countries = templateGroups
    .map((g) => ({ key: g.folder, value: g.name }))
    .sort((a) => (a.value === regime ? -1 : 1));

  $: selectedFlag = countries.find((c) => c.value === regime)?.key;
</script>

<div>
  <p class="block text-sm font-medium leading-6 text-gray-900">Choose a Regime</p>
  <div class="relative mt-2">
    <input
      on:click={() => {
        open = !open;
      }}
      readonly
      value={regime}
      id="combobox"
      type="text"
      class="w-full rounded-md border-0 bg-white py-1.5 pl-9 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      role="combobox"
      aria-controls="options"
      aria-expanded="false"
    />
    <p class="absolute top-2 left-3">
      <span class={`fi fis fi-${selectedFlag}`} />
    </p>
    <button
      on:click={() => {
        open = !open;
      }}
      type="button"
      class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
    >
      <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fill-rule="evenodd"
          d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
    {#if open}
      <ul
        class="absolute z-20 mt-1 max-h-40 w-full overflow-scroll rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        id="options"
        role="listbox"
      >
        {#each countries as country}
          <li class="relative select-none pr-9 text-gray-900 hover:bg-slate-100">
            <button
              class="w-full py-3 pl-3 placeholder-red-300"
              on:click={() => {
                regime = country.value;
                open = false;
              }}
            >
              <div class="flex items-center">
                <span class={`fi fis fi-${country.key}`} />
                <span class="ml-3 truncate" class:font-semibold={country.value === regime}>{country.value}</span>
              </div>
              {#if country.value === regime}
                <span class="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fill-rule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
              {/if}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
