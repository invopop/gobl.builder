import type { JSONSchema7 } from "json-schema";
import { path } from "./path.js";
import * as GOBL from "@invopop/gobl-worker";

export type Schema = JSONSchema7;

const EMPTY_SCHEMA: Schema = {
  type: "object",
  $comment: "empty-schema",
  description: "",
  $id: "",
  $schema: "http://json-schema.org/draft/2020-12/schema",
  properties: {},
};

export async function fetchJsonSchema(url: string) {
  const GOBL_URL = "https://gobl.org/draft-0/";
  // We only support loading json from the worker without ?query=modifiers
  const GOBL_URL_REGEX = /^https:\/\/gobl\.org\/draft-0\/[^?]*$/;

  const isGoblSchema = GOBL_URL_REGEX.test(url);

  if (isGoblSchema) {
    return await GOBL.schema(url.replace(GOBL_URL, ""));
  }

  const response = await fetch(url);
  return await response.json();
}

export const SchemaRegistry: Record<string, Schema> = {};
// export const ParsedSchemaRegistry: Record<string, Schema> = {};

function getRelativeSchema(parentSchema: Schema, id: string, del = "/"): Schema {
  id = id.replace(/#\//, "");
  return path(parentSchema, id, del);
}

async function fetchExternalSchema(id: string): Promise<Schema> {
  let schema = SchemaRegistry[id];
  if (schema) return schema;

  try {
    const result = await fetchJsonSchema(id);

    schema = JSON.parse(result);

    SchemaRegistry[id] = schema;

    return schema;
  } catch (error) {
    return EMPTY_SCHEMA;
  }
}

async function fetchSchema(id: string): Promise<Schema> {
  let schema = SchemaRegistry[id];
  if (schema) return schema;

  const [absId, relId] = id.split("#/");

  const parentSchema = await fetchExternalSchema(absId);
  schema = relId ? getRelativeSchema(parentSchema, relId) : parentSchema;

  SchemaRegistry[id] = schema;
  return schema;
}

export async function parseSchema(id: string, schema: Schema): Promise<Schema> {
  const pSchema = { ...schema, $id: id };
  delete pSchema.$ref;
  delete pSchema.$defs;

  const ref = schema.$ref;

  if (ref) {
    const relId = ref.startsWith("#") ? `${id.split("#")[0]}${ref}` : ref;
    const refSchema = await getSchema(relId);

    return {
      ...refSchema,
      ...pSchema,
      // type: "number" is used to display the content right aligned
      type: relId.includes("num/amount") || relId.includes("num/percent") ? "number" : refSchema.type,
    };
  }

  // Object type
  if (pSchema.type === "object" && pSchema.properties) {
    for (const [k, v] of Object.entries(pSchema.properties)) {
      pSchema.properties[k] = await parseSchema(id, v as Schema);
    }
  }

  // Array type
  if (pSchema.type === "array" && pSchema.items) {
    if (Array.isArray(pSchema.items)) {
      for (const [i, v] of pSchema.items.entries()) {
        pSchema.items[i] = await parseSchema(id, v as Schema);
      }
    } else {
      pSchema.items = await parseSchema(id, pSchema.items as Schema);
    }
  }

  return pSchema;
}

async function getSchema(id: string) {
  // let schema = ParsedSchemaRegistry[id];
  // if (schema) return schema;

  let schema = await fetchSchema(id);
  schema = await parseSchema(id, schema);

  // ParsedSchemaRegistry[id] = schema;

  // console.log('SchemaRegistry', SchemaRegistry)
  // console.log('ParsedSchemaRegistry', ParsedSchemaRegistry)

  return schema;
}

export async function getRootSchema(id: string) {
  const schema = await getSchema(id);
  schema.properties = schema.properties || {};

  const schemaKey = "$schema";
  const schemaValue = {
    $id: id,
    title: schemaKey,
    type: "string",
    calculated: true,
  };

  schema.properties = {
    [schemaKey]: schemaValue,
    ...schema.properties,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  if (schema.required) {
    schema.required.unshift(schemaKey);
  }

  return schema;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaValue = JSON | string | number | boolean | any[] | Record<string, unknown> | null | undefined | Error;
