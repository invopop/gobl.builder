import { clsx } from "clsx";

export function iconButtonClasses(disabled: boolean): string {
  return clsx("p-1.5 rounded border border-neutral-300", {
    "text-white hover:text-cyan-500 hover:border-cyan-500": !disabled,
    "text-neutral-300 cursor-not-allowed": disabled,
  });
}
