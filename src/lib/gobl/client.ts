import { envelopeGOBLSchema } from '$lib/helpers/envelope'

// Default public GOBL API endpoint. Embedders can override this via the
// `apiBaseUrl` prop on the editor components, for example to point at a
// same-origin proxy endpoint that adds authentication.
export const DEFAULT_API_BASE_URL = 'https://gobl.dev/v0'

let apiBaseUrl = DEFAULT_API_BASE_URL

// Set the base URL used for all GOBL API requests. A trailing slash is
// stripped so paths can be appended consistently.
export function setApiBaseUrl(url: string) {
  if (!url) return
  apiBaseUrl = url.replace(/\/+$/, '')
}

export function getApiBaseUrl(): string {
  return apiBaseUrl
}

// GOBLError mirrors the error structure previously provided by the WASM
// worker: `message` contains the raw JSON error body returned by the API
// (parsed downstream by `parseGOBLError` in `$lib/helpers`), and `code` is
// the HTTP status code.
export type GOBLError = {
  message: string
  code: number
}

export type Keypair = {
  private: JsonWebKey
  public: Omit<JsonWebKey, 'd'>
}

// Normalize an unknown thrown value into a GOBLError.
export function parseGOBLError(err: unknown): GOBLError {
  if (err && typeof err === 'object' && 'message' in err) {
    const e = err as { message: unknown; code?: unknown }
    return {
      message: String(e.message),
      code: typeof e.code === 'number' ? e.code : 0
    }
  }
  return { message: String(err), code: 0 }
}

export function isEnvelope(data: Record<string, unknown> | null): boolean {
  return data?.$schema === envelopeGOBLSchema
}

// Documents are accepted as any plain object (bare GOBL document or full
// envelope) and returned as parsed JSON.
type DocumentInput = object
type DocumentResult = Record<string, unknown>

async function request<T>(
  path: string,
  opts: { method?: string; body?: unknown } = {}
): Promise<T> {
  const hasBody = opts.body !== undefined
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: opts.method ?? 'POST',
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(opts.body) : undefined
  })

  if (!res.ok) {
    // Keep the raw response body as the error message: it contains the
    // GOBL error JSON ({key, message, faults}) consumed downstream.
    const goblErr: GOBLError = { message: await res.text(), code: res.status }
    throw goblErr
  }

  return (await res.json()) as T
}

// Parse, calculate and validate a document, optionally wrapping it in an
// envelope. `data` may be a bare document or a full envelope.
export function build<T = DocumentResult>(
  data: DocumentInput,
  opts: { envelop?: boolean } = {}
): Promise<T> {
  return request('/build', { body: { data, ...opts } })
}

// Build the document, wrap it in an envelope and sign it with the given
// private key.
export function sign<T = DocumentResult>(data: DocumentInput, privatekey: JsonWebKey): Promise<T> {
  return request('/sign', { body: { data, privatekey } })
}

// Validate a document or envelope without modifying it. Throws a GOBLError
// when validation fails.
export async function validate(data: DocumentInput): Promise<void> {
  await request('/validate', { body: { data } })
}

// Generate a credit note, debit note or corrective document.
export function correct<T = DocumentResult>(data: DocumentInput, options?: object): Promise<T> {
  return request('/correct', { body: { data, options } })
}

// Fetch the JSON schema describing the correction options available for the
// given document. Returns null when the document cannot be corrected.
export function correctionOptionsSchema(data: DocumentInput): Promise<DocumentResult | null> {
  return request('/correct', { body: { data, schema: true } })
}

// Create a copy of the document with a fresh UUID and no signatures.
export function replicate<T = DocumentResult>(data: DocumentInput): Promise<T> {
  return request('/replicate', { body: { data } })
}

// Generate a new ES256 keypair for signing documents.
export function keygen(): Promise<Keypair> {
  return request('/keygen')
}

// List the IDs of all available JSON schemas.
export async function schemas(): Promise<string[]> {
  const res = await request<{ schemas: string[] }>('/schemas', { method: 'GET' })
  return res.schemas
}

// Fetch a single JSON schema by path, e.g. "bill/invoice".
export function schema(path: string): Promise<DocumentResult> {
  return request(`/schemas/${path}`, { method: 'GET' })
}
