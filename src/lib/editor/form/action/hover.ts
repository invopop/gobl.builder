export default function hover(node: HTMLElement) {
  function handleHover(isHover: boolean) {
    node.dispatchEvent(new CustomEvent("hover", {
      detail: isHover
    }))
  }

  function handleMouseOver(e: MouseEvent) {
    e.stopPropagation();
    handleHover(true)
  }

  function handleMouseOut(e: MouseEvent) {
    e.stopPropagation();
    handleHover(false);
  }

  function handleFocus(e: FocusEvent) {
    e.stopPropagation();
    handleHover(true);
  }

  function handleBlur(e: FocusEvent) {
    e.stopPropagation();
    handleHover(true);
  }

  node.addEventListener("mouseover", handleMouseOver);
  node.addEventListener("mouseout", handleMouseOut);
  node.addEventListener("focus", handleFocus);
  node.addEventListener("blur", handleBlur);

  return {
    destroy() {
      node.removeEventListener("mouseover", handleMouseOver);
      node.removeEventListener("mouseout", handleMouseOut);
      node.removeEventListener("focus", handleFocus);
      node.removeEventListener("blur", handleBlur);
    },
  };
}
