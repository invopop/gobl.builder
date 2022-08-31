import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async function ({ event, resolve }) {
  return resolve(event, { ssr: false });
};
