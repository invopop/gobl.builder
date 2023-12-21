import { clsx } from "clsx";

export function iconButtonClasses(disabled: boolean): string {
  return clsx("p-1 rounded-lg", {
    "text-neutral-700 hover:bg-neutral-100": !disabled,
    "text-neutral-300 cursor-not-allowed": disabled,
  });
}
