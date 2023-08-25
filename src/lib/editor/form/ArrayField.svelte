<script lang="ts">
  import ObjectField from "./ObjectField.svelte";
  $: props = $$props as any;
</script>

<ObjectField {...props}>
  <slot />
</ObjectField>
