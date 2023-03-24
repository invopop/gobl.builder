import type { JSONSchema7 } from 'json-schema';

export type Schema = JSONSchema7

export const SchemaRegistry: Record<string, Schema> = {}
export const ParsedSchemaRegistry: Record<string, Schema> = {}

function getRelativeSchema(obj: any, path: string, del = '/'): Schema {
  for (const p of path.split(del)) {
    if (p === '#') continue
    if (obj === undefined) break
    obj = obj?.[p]
  }

  return obj
}

async function fetchExternalSchema(id: string): Promise<Schema> {
  let schema = SchemaRegistry[id]
  if (schema) return schema

  const response = await fetch(id);
  schema = await response.json();

  SchemaRegistry[id] = schema
  return schema
}

async function fetchSchema(id: string): Promise<Schema> {
  let schema = SchemaRegistry[id]
  if (schema) return schema

  const [absId, relId] = id.split('#/')

  const parentSchema = await fetchExternalSchema(absId);
  schema = relId ? getRelativeSchema(parentSchema, relId) : parentSchema

  SchemaRegistry[id] = schema
  return schema
}

async function parseSchema(id: string, schema: Schema): Promise<Schema> {
  if (schema.$ref) {
    const relId = schema.$ref.startsWith('#') ? `${id.split('#')[0]}${schema.$ref}` : schema.$ref
    return await getSchema(relId)
  }

  schema = { ...schema, $id: id }

  delete schema.$ref
  delete schema.$defs

  // Object type
  if (schema.type === 'object' && schema.properties) {
    for (const [k, v] of Object.entries(schema.properties)) {
      schema.properties[k] = await parseSchema(id, v as Schema)
    }
  }

  // Array type
  if (schema.type === 'array' && schema.items) {
    if (Array.isArray(schema.items)) {
      for (const [i, v] of schema.items.entries()) {
        schema.items[i] = await parseSchema(id, v as Schema)
      }
    } else {
      schema.items = await parseSchema(id, schema.items as Schema)
    }
  }

  return schema
}

export async function getSchema(id: string) {
  let schema = ParsedSchemaRegistry[id]
  if (schema) return schema

  schema = await fetchSchema(id)
  schema = await parseSchema(id, schema)

  ParsedSchemaRegistry[id] = schema

  // console.log('SchemaRegistry', SchemaRegistry)
  // console.log('ParsedSchemaRegistry', ParsedSchemaRegistry)

  return schema
}

export async function getUIModel({
  schema,
  instance,
  title,
  index = 0,
  level = 0
}: {
  schema: Schema | string,
  instance: JSON,
  title?: string,
  index?: number
  level?: number
}): Promise<UIModelField | undefined> {
  schema = typeof schema === 'string' ? await getSchema(schema) : schema
  if (!schema) return

  title = title || schema.title || schema.$id?.split('/').slice(-1)[0]

  const out: UIModelField = {
    id: `${schema.$id}|${level}|${index}`,
    title,
    type: schema.type as string,
    format: schema.format,
    value: instance,
    required: false,
    index,
    level
  }

  if (!instance) return out

  switch (schema.type) {
    case 'object': {
      for (const [k, v] of Object.entries(instance)) {
        const subSchema = schema.properties?.[k] as Schema | undefined
        if (!subSchema) continue

        out.children = out.children || {}
        const childUISchema = await getUIModel({
          schema: subSchema,
          instance: v,
          title: k,
          index: index++,
          level: level + 1,
        })

        if (!childUISchema) continue

        childUISchema.index = index
        out.children[k] = childUISchema
      }
      break
    }
    case 'array': {
      // @todo: Support multiple types (Schema[])
      const subSchema = schema.items as Schema | undefined
      if (!subSchema) break

      for (const [k, v] of Object.entries(instance)) {
        out.children = out.children || {}
        const childUISchema = await getUIModel({
          schema: subSchema,
          instance: v,
          title: k,
          index: index++,
          level: level + 1,
        })

        if (!childUISchema) continue

        childUISchema.index = index
        out.children[k] = childUISchema
      }
      break
    }
  }

  return out
}

export type UIModelField<T = any> = {
  id: string
  title?: string
  type: string
  format?: string
  value: T
  required: boolean
  index: number
  level: number
  children?: Record<string, UIModelField>
}

export function getParsedSchemaRegistry(): any {
  return ParsedSchemaRegistry
}