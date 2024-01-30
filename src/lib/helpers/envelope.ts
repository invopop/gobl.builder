import type { Document, Envelope } from "$lib/types/envelope";

export const envelopeGOBLSchema = "https://gobl.org/draft-0/envelope";

export function newEnvelope(doc: Document | null): Envelope {
  return {
    $schema: envelopeGOBLSchema,
    doc: doc,
    head: {
      draft: true,
    },
  };
}
