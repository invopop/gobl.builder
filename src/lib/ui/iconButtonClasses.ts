import { clsx } from "clsx";

export function iconButtonClasses(disabled: boolean): string {
  return clsx("p-1.5 rounded border border-gobl-300", {
    "text-white hover:text-gobl-50 hover:border-gobl-50": !disabled,
    "text-gobl-300 cursor-not-allowed": disabled,
  });
}
