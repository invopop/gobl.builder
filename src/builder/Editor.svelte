<script lang="ts">
  import { editor } from "./stores";
</script>

<textarea cols="80" rows="20" spellcheck="false" bind:value={$editor} />

<style>
  textarea {
    font-family: "Fira Code", monospace;
  }
</style>
