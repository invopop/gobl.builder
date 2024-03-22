<script lang="ts">
  export let open = true;
</script>

<button class="align-middle ml-2" tabindex="-1" on:click>
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" class:-rotate-90={!open}>
    <circle cx="10" cy="10" r="8" fill="#F3F5F5" />
    <path d="M6.5 8.25004L10 11.75L13.5 8.25" stroke="#0A0A0A" stroke-width="1.2" />
  </svg>
</button>
