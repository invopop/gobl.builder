import { clsx } from "clsx";

export function iconButtonClasses(disabled: boolean): string {
  return clsx("p-2 rounded-lg", {
    "text-gray-700 hover:bg-gray-200": !disabled,
    "text-gray-300 cursor-not-allowed": disabled,
  });
}
