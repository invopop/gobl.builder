// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function path(obj: any, path: string, del = "."): any {
  for (const p of path.split(del)) {
    if (p === "#") continue;
    if (obj === undefined) break;
    obj = obj?.[p];
  }

  return obj;
}
