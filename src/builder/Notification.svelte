<script lang="ts">
  import classNames from "classnames";
  import { Severity } from "./notifications";

  export let severity: Severity = Severity.Info;
  export let message: string;
  export let context: string | null = null;
</script>

<div
  class={classNames("py-2 px-6 text-sm rounded-full w-fit shadow", {
    "text-blue-700 bg-blue-100 dark:bg-blue-200 dark:text-blue-800": severity === Severity.Info,
    "text-green-700 bg-green-100 dark:bg-green-200 dark:text-green-800": severity === Severity.Success,
    "text-red-700 bg-red-100 dark:bg-red-200 dark:text-red-800": severity === Severity.Error,
  })}
  role="alert"
>
  <span class="font-medium">{message}</span>
  {#if context}
    <code>{context}</code>
  {/if}
</div>
