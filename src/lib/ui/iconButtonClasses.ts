import { clsx } from "clsx";

export function iconButtonClasses(disabled: boolean): string {
  return clsx("p-2 rounded-lg flex items-center justify-center", {
    "text-grey-4 font-medium hover:bg-gray-200": !disabled,
    "text-grey-3 cursor-not-allowed": disabled,
  });
}

export function actionButtonClasses(disabled: boolean): string {
  return clsx("flex items-center justify-start w-full gap-2 py-3 px-4 whitespace-nowrap text-ellipsis", {
    "text-grey-4 font-medium hover:bg-gray-200": !disabled,
    "text-grey-3 cursor-not-allowed": disabled,
  });
}

export function editorViewButtonClasses(disabled: boolean, right: boolean): string {
  return clsx("py-2 px-6 rounded text-sm flex items-center justify-center gap-1", {
    "text-grey-5 font-medium": !disabled,
    "text-grey-4 bg-white shadow-right cursor-default font-medium": disabled,
    "shadow-right": !right && disabled,
    "shadow-left": right && disabled,
  });
  
}
