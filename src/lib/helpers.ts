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

export function getGOBLErrorMessage(message: string) {
  const parsedError = JSON.parse(message);

  let m = "";

  if (parsedError.key === "validation") {
    m = getErrorString(parsedError.fields?.doc || parsedError.fields?.head || {});
  }

  if (parsedError.key === "calculation") {
    m = getErrorString(parsedError.fields || {});
  }

  return m || parsedError.message || parsedError.key || "Unknown error";
}

export async function displayAllErrors(error: string) {
  const errorMessage = getGOBLErrorMessage(error);
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

export function getAgentSystem() {
  if (!("navigator" in window)) {
    return "unknown";
  }

  if (navigator.userAgent.indexOf("Win") > -1) return "windows";
  if (navigator.userAgent.indexOf("Mac") > -1) return "mac";
  if (navigator.userAgent.indexOf("Linux") > -1) return "linux";
  if (navigator.userAgent.indexOf("Android") > -1) return "android";
  if (navigator.userAgent.indexOf("like Mac") > -1) return "ios";

  return "unknown";
}
