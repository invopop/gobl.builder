import { clsx } from "clsx";

export function iconButtonClasses(disabled: boolean): string {
  return clsx("p-2 rounded-lg flex items-center justify-center", {
    "text-gray-700 hover:bg-gray-200": !disabled,
    "text-gray-300 cursor-not-allowed": disabled,
  });
}

export function actionButtonClasses(disabled: boolean): string {
  return clsx("flex items-center justify-start w-full gap-2 py-3 px-4 whitespace-nowrap text-ellipsis", {
    "text-gray-700 hover:bg-gray-200": !disabled,
    "text-gray-300 cursor-not-allowed": disabled,
  });
}

export function editorViewButtonClasses(disabled: boolean): string {
  return clsx("py-1.5 px-10 rounded-md text-sm flex items-center justify-center gap-1", {
    "text-gray-300 font-medium": !disabled,
    "text-gray-700 bg-white cursor-default font-semibold": disabled,
  });
}
