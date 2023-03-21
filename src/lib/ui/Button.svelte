<script lang="ts">
  import { clsx } from "clsx";

  export let disabled = false;

  $: classes = clsx("text-white dark:text-black font-medium text-sm px-4 py-2 rounded-md", {
    "text-gray-600 dark:text-gray-400 bg-gray-300 dark:bg-gray-700 cursor-not-allowed": disabled,
    "bg-sky-500 hover:bg-sky-600 dark:hover:bg-sky-400 focus:ring-4 focus:ring-sky-300 dark:focus:ring-sky-700 focus:outline-none":
      !disabled,
  });
</script>

<button on:click class={classes} {...$$props} disabled={false}>
  <slot />
</button>
