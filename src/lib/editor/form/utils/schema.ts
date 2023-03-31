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

async function getSchema(id: string) {
  let schema = ParsedSchemaRegistry[id]
  if (schema) return schema

  schema = await fetchSchema(id)
  schema = await parseSchema(id, schema)

  ParsedSchemaRegistry[id] = schema

  // console.log('SchemaRegistry', SchemaRegistry)
  // console.log('ParsedSchemaRegistry', ParsedSchemaRegistry)

  return schema
}

export async function getRootSchema(id: string) {
  const schema = await getSchema(id)
  schema.properties = schema.properties || {}

  const schemaKey = '$schema'

  schema.properties[schemaKey] = {
    title: schemaKey,
    type: "string"
  }

  if (schema.required) {
    schema.required.push(schemaKey)
  }

  return schema
}

export type SchemaValue = JSON | string | number | boolean | any[] | Record<string, unknown> | null | undefined

export async function getUIModel<V extends SchemaValue>({
  schema,
  value,
  name,
  index = 0,
  level = 0,
  parent,
  root,
}: {
  schema: Schema | string
  value: V
  name?: string
  index?: number
  level?: number
  parent?: UIModelField
  root?: UIModel
}): Promise<UIModelField<V> | undefined> {
  schema = typeof schema === 'string' ? await getRootSchema(schema) : schema
  if (!schema) return

  name = name || schema.title || schema.$id?.split('/').slice(-1)[0]

  const id = (`${schema.$id}|${level}|${index}`).replace(/[^a-zA-Z0-9]/g, '')

  const out: UIModelField<V> = {
    id,
    name,
    type: schema.type as string,
    value,
    index,
    level,
    parent,
    root: root as UIModel,
    schema,
    is: {
      required: !!name && (parent?.schema.required || []).includes(name),
      root: !root,
      disposable: !!root,
      duplicable: parent?.type === 'array'
    }
  }

  // Define the root the first time
  if (out.is.root) out.root = out as UIModel

  switch (schema.type) {
    case 'object': {
      for (const [k, v] of Object.entries(value || {})) {
        const subSchema = schema.properties?.[k] as Schema | undefined
        if (!subSchema) continue

        out.children = out.children || {}
        const childUISchema = await getUIModel({
          schema: subSchema,
          value: v,
          name: k,
          index: index++,
          level: level + 1,
          parent: out,
          root: out.root,
        })

        if (!childUISchema) continue

        childUISchema.index = index
        out.children[k] = childUISchema
      }

      out.options = Object
        .entries(schema.properties || {})
        .map<SchemaOption>(([name, subSchema]) => ({
          name,
          required: !!name && ((schema as Schema).required || []).includes(name),
          schema: subSchema as Schema
        }))
        .filter(opt => !(value as Record<string, unknown>)?.[opt.name])

      break
    }
    case 'array': {
      // @todo: Support multiple types (Schema[])
      const subSchema = schema.items as Schema | undefined
      if (!subSchema) break

      for (const [k, v] of Object.entries(value || [])) {
        out.children = out.children || {}
        const childUISchema = await getUIModel({
          schema: subSchema,
          value: v,
          name: k,
          index: index++,
          level: level + 1,
          parent: out,
          root: out.root,
        })

        if (!childUISchema) continue

        childUISchema.index = index
        out.children[k] = childUISchema
      }

      out.options = [{
        name: `${name} item`,
        required: !!name && (schema.required || []).includes(name),
        schema: subSchema
      }]

      break
    }
  }

  return out
}

export function getJSONFromUIModel(field: UIModelField): any {
  switch (field.type) {
    case 'object': {
      return Object
        .entries(field.children || {})
        .reduce((acc, [k, v]) => {
          acc[k] = getJSONFromUIModel(v)
          return acc
        }, {} as Record<string, any>)
    }
    case 'array': {
      return Object
        .values(field.children || {})
        .map(v => getJSONFromUIModel(v))
    }
    default: {
      return field.value
    }
  }
}

export type SchemaOption = {
  name: string
  required: boolean
  schema: Schema
}

export type UIModelField<T = unknown> = {
  id: string
  name?: string
  type: string
  value: T
  index: number
  level: number
  children?: Record<string, UIModelField>
  parent?: UIModelField
  root: UIModel
  schema: Schema
  options?: SchemaOption[]
  is: {
    root: boolean
    required: boolean
    disposable: boolean
    duplicable: boolean
  }
}

export type UIModelFieldObject<T = unknown> = UIModelField<Record<string, T>> & {
  type: 'object'
  children?: Record<string, UIModelField>
}

export type UIModelFieldArray<T = unknown> = UIModelField<Array<T>> & {
  type: 'array'
  children?: Record<string, UIModelField>
}

export type UIModel = UIModelField<Record<string, any>>

export function fieldIsObject(field: UIModelField<unknown>): field is UIModelFieldObject {
  return field.type === 'object'
}

export function fieldIsArray(field: UIModelField<unknown>): field is UIModelFieldArray {
  return field.type === 'array'
}

export function getParsedSchemaRegistry(): any {
  return ParsedSchemaRegistry
}
