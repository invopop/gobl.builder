<script lang="ts">
  import classNames from "classnames";

  export let disabled = false;

  $: classes = classNames("text-white font-medium rounded-lg text-sm px-4 py-2", {
    "text-gray-600 bg-gray-300 dark:bg-gray-500 cursor-not-allowed": disabled,
    "bg-sky-500 hover:bg-sky-600 focus:ring-4 focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 focus:outline-none dark:focus:ring-sky-800":
      !disabled,
  });
</script>

<button on:click class={classes} {...$$props} {disabled}>
  <slot />
</button>
