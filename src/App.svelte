<script lang="ts">
  import Editor from "./builder/Editor.svelte";
  import Actions from "./builder/Actions.svelte";

  import "./app.css";
  import StatusBar from "./builder/StatusBar.svelte";
</script>

<div style="float: left;">
  <Editor />
</div>
<div style="clear: left; float: left">
  <StatusBar />
</div>
<div style="clear: left; float: left">
  <Actions />
</div>
