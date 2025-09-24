<script lang="ts">
  import type { ExpandButtonProps } from '$lib/types/editor'

  let { open = true, onclick }: ExpandButtonProps = $props()
</script>

<button aria-label="expand" class="align-middle ml-2" tabindex="-1" {onclick}>
  <svg
    width="20"
    height="24"
    viewBox="0 0 20 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class:-rotate-90={!open}
  >
    <rect x="2" y="4" width="16" height="16" rx="4" fill="#F3F4F6" />
    <path d="M6.5 10.25L10 13.75L13.5 10.25" stroke="#030712" stroke-width="1.1" />
  </svg>
</button>
