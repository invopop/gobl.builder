import type { JSONSchema7 } from 'json-schema'
import { path } from './path.js'
import * as GOBL from '$lib/gobl/client'

export type Schema = JSONSchema7

const GOBL_SCHEMA_PREFIX = 'https://gobl.org/draft-0/'

const EMPTY_SCHEMA: Schema = {
  type: 'object',
  $comment: 'empty-schema',
  description: '',
  $id: '',
  $schema: 'http://json-schema.org/draft/2020-12/schema',
  properties: {}
}

export async function fetchJsonSchema(url: string): Promise<Schema> {
  // Query modifiers (e.g. ?tax_regime=) are ignored by the schema servers,
  // so they are stripped before loading the schema through the API.
  const GOBL_URL_REGEX = /^https:\/\/gobl\.org\/draft-0\/([^?#]+)/

  const match = url.match(GOBL_URL_REGEX)
  if (match) {
    return (await GOBL.schema(match[1])) as Schema
  }

  const response = await fetch(url)
  return await response.json()
}

export const SchemaRegistry: Record<string, Schema> = {}

function getRelativeSchema(parentSchema: Schema, id: string, del = '/'): Schema | undefined {
  id = id.replace(/#\//, '')
  return path(parentSchema, id, del)
}

// In-flight schema requests, keyed by URL, so that concurrent consumers
// (the form parser branches and the Monaco preload) share a single fetch
// instead of each missing the registry cache and requesting the same
// schema again.
const pendingSchemas: Record<string, Promise<Schema>> = {}

function fetchExternalSchemaStrict(id: string): Promise<Schema> {
  const schema = SchemaRegistry[id]
  if (schema) return Promise.resolve(schema)

  let req = pendingSchemas[id]
  if (!req) {
    req = fetchJsonSchema(id)
      .then((fetched) => {
        SchemaRegistry[id] = fetched
        return fetched
      })
      .finally(() => {
        delete pendingSchemas[id]
      })
    pendingSchemas[id] = req
  }
  return req
}

async function fetchExternalSchema(id: string): Promise<Schema> {
  try {
    return await fetchExternalSchemaStrict(id)
  } catch (error) {
    return EMPTY_SCHEMA
  }
}

// walkSchemaSet loads the schema at the given id together with every GOBL
// schema it references, directly or transitively, into the shared registry.
// Following references breadth-first through a `found` set means recursive
// schemas (org/party references itself through its `agent` property) are
// visited exactly once.
async function walkSchemaSet(rootId: string): Promise<Map<string, Schema>> {
  const found = new Map<string, Schema>()
  const queue = [rootId]

  while (queue.length > 0) {
    const id = queue.shift() as string
    if (found.has(id)) continue

    const schema = await fetchExternalSchema(id)
    found.set(id, schema)

    for (const ref of collectGOBLRefs(schema)) {
      const base = ref.split('#')[0]
      if (base && !found.has(base)) {
        queue.push(base)
      }
    }
  }

  return found
}

// loadSchemaSet fetches the schema at the given URL together with every
// GOBL schema it references, directly or transitively, reusing the shared
// SchemaRegistry cache. Callers like the Monaco code editor can then
// validate documents without requesting any schemas from gobl.org.
// Throws when the root schema cannot be loaded; missing referenced schemas
// degrade to an empty placeholder instead.
export async function loadSchemaSet(url: string): Promise<Array<{ uri: string; schema: Schema }>> {
  const rootId = url.split('#')[0]
  await fetchExternalSchemaStrict(rootId)

  const found = await walkSchemaSet(rootId)

  // Deep-clone the returned schemas so callers hold a stable snapshot that
  // can never share mutable objects with the registry or the form parser.
  return [...found.entries()].map(([uri, schema]) => ({ uri, schema: structuredClone(schema) }))
}

// preloadSchemas warms the registry with every GOBL schema reachable from the
// given root, plus those named by `$schema` inside the document itself. Once
// warm, resolving a reference is a registry lookup rather than a fetch, which
// is what lets the form model expand schemas synchronously and lazily, one
// level at a time, instead of walking the whole schema tree up front.
export async function preloadSchemas(root: string | Schema, value: SchemaValue): Promise<void> {
  const roots = new Set<string>()

  if (typeof root === 'string') {
    if (root) roots.add(root.split('#')[0])
  } else {
    for (const ref of collectGOBLRefs(root)) {
      roots.add(ref.split('#')[0])
    }
  }

  for (const id of collectValueSchemas(value)) {
    roots.add(id)
  }

  await Promise.all(
    // A schema that cannot be loaded resolves to an empty placeholder later
    // on, the same degradation the form applied when schemas were fetched
    // one reference at a time.
    [...roots].map((id) => walkSchemaSet(id).catch(() => undefined))
  )
}

// collectValueSchemas finds the schema identifiers a document carries in its
// `$schema` properties, so dynamically typed nodes (the envelope `doc`, or a
// document's `complements`) have their schemas registered before the model
// asks for them.
function collectValueSchemas(value: SchemaValue, found = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectValueSchemas(item as SchemaValue, found)
    }
    return found
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === '$schema' && typeof item === 'string' && item.startsWith(GOBL_SCHEMA_PREFIX)) {
        found.add(item.split('#')[0])
      } else {
        collectValueSchemas(item as SchemaValue, found)
      }
    }
  }
  return found
}

function collectGOBLRefs(node: unknown, refs = new Set<string>()): Set<string> {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectGOBLRefs(item, refs)
    }
    return refs
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === '$ref' && typeof value === 'string' && value.startsWith(GOBL_SCHEMA_PREFIX)) {
        refs.add(value)
      } else {
        collectGOBLRefs(value, refs)
      }
    }
  }
  return refs
}

// registerSchema seeds the registry with a schema that was obtained outside
// the normal fetch path (the regime-specific correction options come back
// from the API's /correct endpoint), so its own internal references resolve
// locally instead of missing the cache.
export function registerSchema(schema: Schema): void {
  const id = schema.$id
  if (!id || SchemaRegistry[id]) return
  SchemaRegistry[id] = schema
}

// hasSchema reports whether an id can be resolved from the registry, so that
// a reference to a schema that could not be loaded can fall back to
// something more useful than an empty placeholder.
function hasSchema(id: string): boolean {
  if (SchemaRegistry[id]) return true
  return !!SchemaRegistry[id.split('#/')[0]]
}

// lookupSchema resolves a schema id against the registry, following the
// `#/`-fragment into the parent document when present. It never fetches:
// callers preload the schemas they need through preloadSchemas.
function lookupSchema(id: string): Schema {
  const cached = SchemaRegistry[id]
  if (cached) return cached

  const [absId, relId] = id.split('#/')
  const parent = SchemaRegistry[absId]
  if (!parent) return EMPTY_SCHEMA

  const schema = (relId ? getRelativeSchema(parent, relId) : parent) ?? EMPTY_SCHEMA
  SchemaRegistry[id] = schema
  return schema
}

// A reference chain that never reaches a concrete schema is a broken schema
// rather than a recursive one; stop following it instead of hanging.
const MAX_REF_HOPS = 32

// dynamicSchemaId reads the schema a `schema/object` value declares for
// itself, either directly or, for a whole array of them, from its first entry.
function dynamicSchemaId(target: unknown): string | undefined {
  const entry = Array.isArray(target) ? target[0] : target
  if (!entry || typeof entry !== 'object') return undefined

  const id = (entry as Record<string, unknown>).$schema
  return typeof id === 'string' && id ? id : undefined
}

// resolveSchema expands a single schema node for display: it follows the
// node's own `$ref` chain and resolves its immediate children one level
// further, which is everything a form field needs to render itself and to
// list the fields that can be added below it.
//
// Deeper levels stay unresolved until a field is actually built for them.
// That keeps recursive schemas finite — org/party references itself through
// `agent`, so expanding eagerly never terminates — and means a document only
// pays for the part of the schema it uses.
export function resolveSchema(
  id: string,
  schema: Schema,
  value: SchemaValue = undefined,
  key: string | undefined = undefined
): Schema {
  return resolveNode(id, schema, value, key, 1, 0)
}

function resolveNode(
  id: string,
  schema: Schema,
  value: SchemaValue,
  key: string | undefined,
  depth: number,
  hops: number
): Schema {
  const ref = schema.$ref || ''

  const isSchemaObject = ref.includes('schema/object') && !!value && !!key

  const pSchema = { ...schema }

  // We need to keep the original ref in order to re-resolve the subSchema
  // against the value of each individual schema object.
  if (!isSchemaObject) {
    delete pSchema.$ref
  }

  delete pSchema.$defs

  if (ref && hops < MAX_REF_HOPS) {
    let relId = ref.startsWith('#') ? `${id.split('#')[0]}${ref}` : ref

    let addSchemaProp = false

    if (isSchemaObject) {
      addSchemaProp = true
      const targetValue = value as Record<string, unknown>
      const dynamicId = dynamicSchemaId(targetValue[key as string])
      // Schema objects may name a schema hosted elsewhere (an addon's, say)
      // that could not be loaded. Keep the generic `schema/object` shape for
      // those rather than presenting the field as an empty object.
      if (dynamicId && hasSchema(dynamicId)) {
        relId = dynamicId
      }
    }

    // Following a reference does not descend a level of the document, so the
    // remaining depth is carried over unchanged.
    let refSchema = resolveNode(relId, lookupSchema(relId), value, undefined, depth, hops + 1)

    if (addSchemaProp) {
      const props = refSchema.properties || {}
      const required = refSchema.required || []
      refSchema = {
        ...refSchema,
        properties: {
          ...props,
          $schema: {
            description: 'Schema used for this schema object.',
            title: '$schema',
            type: 'string'
          }
        },
        // A schema object may be resolved more than once (each entry of a
        // `complements` array re-resolves the shared items node), so make
        // sure `$schema` is only listed once.
        required: ['$schema', ...required.filter((name) => name !== '$schema')]
      }
    }

    return {
      ...pSchema,
      ...refSchema,
      title: pSchema.title,
      $id: pSchema.$id || relId,
      // type: "number" is used to display the content right aligned
      type:
        relId.includes('num/amount') || relId.includes('num/percent') ? 'number' : refSchema.type
    }
  }

  if (depth <= 0) return pSchema

  // Children are resolved against the document this node came from, so that
  // its internal references (`#/$defs/tax.Combo` inside tax/set) point at the
  // right document rather than at whichever schema referenced it.
  const baseId = pSchema.$id || id

  // Child maps are rebuilt rather than written through, so a resolved node
  // never shares — or mutates — the objects held in the registry.

  // Object type
  if (pSchema.type === 'object' && pSchema.properties) {
    const properties: Record<string, Schema> = {}
    for (const [k, v] of Object.entries(pSchema.properties)) {
      properties[k] = resolveNode(baseId, v as Schema, value, k, depth - 1, 0)
    }
    pSchema.properties = properties
  }

  // Array type
  if (pSchema.type === 'array' && pSchema.items) {
    if (Array.isArray(pSchema.items)) {
      pSchema.items = pSchema.items.map((v, i) =>
        resolveNode(baseId, v as Schema, value, String(i), depth - 1, 0)
      )
    } else {
      pSchema.items = resolveNode(baseId, pSchema.items as Schema, value, key, depth - 1, 0)
    }
  }

  return pSchema
}

export async function getRootSchema(id: string, value: SchemaValue) {
  await preloadSchemas(id, value)

  const schema = resolveSchema(id, lookupSchema(id), value)
  schema.properties = schema.properties || {}

  const schemaKey = '$schema'
  const schemaValue = {
    $id: id,
    title: schemaKey,
    type: 'string',
    calculated: true
  }

  schema.properties = {
    [schemaKey]: schemaValue,
    ...schema.properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any

  if (schema.required) {
    schema.required = [schemaKey, ...schema.required]
  }

  return schema
}

export type SchemaValue =
  | JSON
  | string
  | number
  | boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | any[]
  | Record<string, unknown>
  | null
  | undefined
  | Error
