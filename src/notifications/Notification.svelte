<script lang="ts">
  import classNames from "classnames";
  import { Severity } from "../notifications";

  export let severity: Severity = Severity.Info;
  export let message: string;
  export let context: string | null = null;
</script>

<div
  class={classNames("py-2 px-6 text-sm rounded-full w-fit shadow", {
    "text-blue-700 bg-blue-100": severity === Severity.Info,
    "text-green-700 bg-green-100": severity === Severity.Success,
    "text-red-700 bg-red-100": severity === Severity.Error,
  })}
  role="alert"
>
  <span class="font-medium">{message}</span>
  {#if context}
    <code>{context}</code>
  {/if}
</div>
