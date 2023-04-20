import { createEventDispatcher } from "svelte";
import { editorViewType } from "$lib/stores.js";

export function getChangeViewHandler(view: "code" | "form") {
  const dispatch = createEventDispatcher();

  return () => {
    editorViewType.set(view);
    const event = view === "code" ? "viewCode" : "viewForm";
    dispatch(event);
    document.dispatchEvent(new Event(`${event}ButtonClick`));
  };
}
