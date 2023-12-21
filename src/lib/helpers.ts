import { toasts } from "svelte-toasts";

export function formatErrors(error: string): string[] {
  // If error does not start with doc: we assume it is a calculation error
  if (!error.startsWith("doc:")) {
    return [error];
  }

  const errors: string[] = [];

  const formatted = `(${error})`
    .replace(/\(/g, '{"')
    .replace(/\.\)/g, "}")
    .replace(/([a-z])}/g, '$1"}')
    .replace(/}; /g, '},"')
    .replace(/; /g, '","')
    .replace(/: /g, '":')
    .replace(/:([a-z])/g, ':"$1');

  const parsed = JSON.parse(formatted);

  const readParsedObj = (obj: Record<string, string>, parent = "") => {
    for (const [key, value] of Object.entries(obj)) {
      const parentKey = parent ? `${parent} > ` : "";
      const isNumber = !isNaN(parseFloat(key));
      const formattedKey = isNumber ? parseFloat(key) + 1 : key;
      if (typeof value === "string") {
        errors.push(`${parentKey}${formattedKey}: ${value}`);
      } else {
        readParsedObj(value, `${parentKey}${formattedKey}`);
      }
    }
  };

  readParsedObj(parsed.doc);

  return errors;
}

export function showErrorToast(description: string) {
  toasts.add({
    type: "error",
    description,
  });
}

export function displayAllErrors(error: string) {
  try {
    const errors = formatErrors(error);
    errors.forEach((e) => {
      showErrorToast(e);
    });
  } catch (error) {
    showErrorToast(error as string);
  }
}
