import { clsx } from "clsx";

export function iconButtonClasses(disabled: boolean): string {
  return clsx("p-2 rounded-lg", {
    "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800": !disabled,
    "text-gray-300 dark:text-gray-700 cursor-not-allowed": disabled,
  });
}
