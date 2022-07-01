<script lang="ts">
  import classNames from "classnames";

  export let disabled = false;
</script>

<button
  on:click
  class={classNames("text-white font-medium rounded-lg text-sm px-5 py-2.5", {
    "bg-blue-400 dark:bg-blue-500 cursor-not-allowed": disabled,
    "bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800":
      !disabled,
  })}
  {...$$props}
>
  <slot />
</button>
