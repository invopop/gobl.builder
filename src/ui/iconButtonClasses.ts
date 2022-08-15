import classNames from "classnames";

export function iconButtonClasses(disabled: boolean): string {
  return classNames("p-2 rounded-lg", {
    "text-gray-700 hover:bg-gray-200": !disabled,
    "text-gray-300 cursor-not-allowed": disabled,
  });
}
