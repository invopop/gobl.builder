export function formatErrors(error: string) {
  // If error does not start with doc: we assume it is a calculation error
  if (!error.startsWith("doc:")) {
    return [error];
  }

  const errors: string[] = [];

  const formatted = `(${error})`
    .replace(/\(/g, '{"')
    .replace(/\.\)/g, "}")
    .replace(/([a-z])}/g, '$1"}')
    .replace(/; /g, '","')
    .replace(/: /g, '":')
    .replace(/:([a-z])/g, ':"$1');

  const parsed = JSON.parse(formatted);

  const readParsedObj = (obj: Record<string, string>, parent = "") => {
    for (const [key, value] of Object.entries(obj)) {
      const parentKey = parent ? `${parent} > ` : "";
      if (typeof value === "string") {
        errors.push(`${parentKey}${key}: ${value}`);
      } else {
        readParsedObj(value, `${parentKey}${key}`);
      }
    }
  };

  readParsedObj(parsed.doc);

  return errors;
}
