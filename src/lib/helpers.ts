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

export function getErrorString(errorObj: Record<string, object | string>) {
  const errorString = parseErrorString(errorObj);

  return errorString.substring(3);
}

export function getErrorPathFromMessage(message: string) {
  const parts = message.split(":")[0];

  return parts.split(" > ");
}

export function parseErrorString(errorObj: Record<string, object | string>, currentPath = "") {
  let errorString = "";

  for (const [key, value] of Object.entries(errorObj)) {
    const newPath = currentPath ? `${currentPath} > ${key}` : key;

    if (typeof value === "object" && value !== null) {
      errorString += parseErrorString(value as Record<string, object | string>, newPath);
    } else {
      errorString += ` / ${newPath}: ${value}`;
    }
  }

  return errorString;
}

export function showErrorToast(description: string) {
  toasts.add({
    type: "error",
    description,
  });
}

export async function displayAllErrors(error: string) {
  const parsedError = JSON.parse(error);
  const errorMessage = parsedError.key === "validation" ? getErrorString(parsedError.fields?.doc) : parsedError.message;
  const errorsArr = errorMessage.split(" / ");

  for (let i = 0; i < errorsArr.length; i++) {
    showErrorToast(errorsArr[i]);
    // Force to await 10 ms so toast component does not break
    // https://github.com/mzohaibqc/svelte-toasts/issues/6
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

export function objectHasEmptyProperties(obj: Record<string, unknown>) {
  for (const key in obj) {
    const value = obj[key];

    if (value === "") {
      return true; // Found an empty string
    }

    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        // If the property is an array, check each element
        for (const element of value) {
          if (objectHasEmptyProperties(element)) {
            return true; // Found an empty string in array element
          }
        }
      } else {
        // If the property is an object (but not an array), recursively check its properties
        if (objectHasEmptyProperties(value as Record<string, unknown>)) {
          return true; // Found an empty string in nested object
        }
      }
    }
  }

  return false; // No empty string found
}
