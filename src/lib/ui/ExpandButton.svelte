<script lang="ts">
  export let open = true;
</script>

<button class="align-middle text-grey-3 hover:text-black ml-2" on:click>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-4 w-4"
    class:-rotate-90={!open}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fill-rule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clip-rule="evenodd"
    />
  </svg>
</button>
