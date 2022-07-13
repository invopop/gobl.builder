<script lang="ts">
  import classNames from "classnames";

  export let disabled = false;

  $: classes = classNames("text-white font-medium rounded-full text-sm px-4 py-2 rounded-md", {
    "text-gray-600 bg-gray-300 cursor-not-allowed": disabled,
    "bg-sky-500 hover:bg-sky-600 focus:ring-4 focus:ring-sky-300 focus:outline-none": !disabled,
  });
</script>

<button on:click class={classes} {...$$props} disabled={false}>
  <slot />
</button>
