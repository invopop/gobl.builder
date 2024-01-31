export interface GOBLDocument {
  $schema: string;
  [key: string]: unknown;
}

export interface Envelope {
  $schema: string;
  doc?: Document | null;
  head?: {
    uuid?: string;
    dig?: {
      alg: string;
      val: string;
    };
    stamps?: Array<{
      prv: string;
      val: string;
    }>;
    tags?: string[];
    meta?: Record<string, unknown>;
    notes?: string;
    draft?: boolean;
  };
  sigs?: string[];
}

// Document contains the data to show in the editor
export interface Document {
  $schema?: string;
  supplier?: {
    tax_id?: {
      country: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
