import { getRootSchema, type Schema, type SchemaValue } from "./schema.js";

export async function getUIModel<V extends SchemaValue>(
  schema: Schema | string,
  value: V
): Promise<UIModelField<V> | undefined> {
  schema = typeof schema === "string" ? await getRootSchema(schema) : schema;
  if (!schema) return;

  return new UIModelField<V>(schema, value);
}

export class UIModelField<V extends SchemaValue | unknown = unknown> {
  public id: string;
  public type: string;
  public root!: UIModelRootField;
  public children?: UIModelField[];
  public childrenMap?: Record<string, UIModelField>;
  public options?: SchemaOption[];
  public error?: Error
  public is: UIModelFieldFlags;

  constructor(
    public schema: Schema,
    public value: V,
    public key: string = String(schema.$id?.split("/").slice(-1)[0] || "root").toLowerCase(),
    public index: number = 0,
    public level: number = 0,
    public parent?: UIModelField,
    root?: UIModelRootField
  ) {
    this.id = `${parent?.id ? `${parent.id}-` : ""}${this.key}`.replace(/[^a-zA-Z0-9-_]/g, "");
    this.type = schema.type as string;
    this.root = !root ? (this as UIModelRootField) : root;
    this.error = value instanceof Error ? value : undefined

    const calculated = (schema as any).calculated || parent?.is.calculated;

    this.is = {
      required: !!this.key && (parent?.schema.required || []).includes(this.key),
      root: !root,
      disposable: !!root,
      duplicable: parent?.type === "array",
      calculated: calculated,
      editable: !calculated,
      error: (value instanceof Error),
      complete: false
    };

    if (!this.is.error && this.schema.pattern) {
      const pattern = new RegExp(this.schema.pattern)
      const valid = pattern.test(this.value as string)

      if (!valid) {
        this.is.error = true
        this.error = new Error(`Invalid format ${this.schema.pattern}`)
      }
    }

    if (!this.is.error && this.is.required && !this.value) {
      this.is.error = true
      this.error = new Error(`Required field`)
    }

    switch (schema.type) {
      case "object": {
        const items = Object.entries((value || {}) as Record<string, SchemaValue>);
        let index = 0;

        for (const [key, value] of items) {
          const subSchema = schema.properties?.[key] as Schema | undefined;
          if (!subSchema) continue;

          const childUISchema = new UIModelField(subSchema, value, key, index, level + 1, this, this.root);

          if (!childUISchema) continue;
          index++;

          this.children = this.children || [];
          this.childrenMap = this.childrenMap || {};
          this.children.push(childUISchema);
          this.childrenMap[key] = childUISchema;
        }

        this.options = Object.entries(schema.properties || {})
          .map<SchemaOption>(([key, subSchema]) => ({
            key,
            required: ((schema as Schema).required || []).includes(key),
            schema: subSchema as Schema,
          }))
          .filter((opt) => !(opt.schema as any).calculated)
          .filter((opt) => (value as Record<string, unknown>)?.[opt.key] === undefined);

        break;
      }
      case "array": {
        // @todo: Support multiple types (Schema[])
        const subSchema = schema.items as Schema | undefined;
        if (!subSchema) break;

        const items = ((value || []) as SchemaValue[]).entries();
        let index = 0;

        for (const [k, value] of items) {
          const key = k + ''
          const childUISchema = new UIModelField(subSchema, value, key, index, level + 1, this, this.root);

          if (!childUISchema) continue;
          index++;

          this.children = this.children || [];
          this.childrenMap = this.childrenMap || {};
          this.children.push(childUISchema);
          this.childrenMap[key] = childUISchema;
        }

        this.options = [
          {
            key: `${this.key} item`,
            required: (schema.required || []).includes(this.key),
            schema: subSchema,
          },
        ];

        break;
      }
    }

    this.is.complete = (this.options || []).length === 0
  }

  isObject(this: UIModelField<unknown>): this is UIModelFieldObject {
    return this.type === "object";
  }

  isArray(this: UIModelField<unknown>): this is UIModelFieldArray {
    return this.type === "array";
  }

  isContainer(this: UIModelField<unknown>): this is UIModelFieldArray | UIModelFieldObject {
    return this.isArray() || this.isObject()
  }

  clone(): UIModelField<V> {
    const clone = new UIModelField(this.schema, this.value, this.key, this.index, this.level, this.parent, this.root);

    clone.id = this.id;
    clone.type = this.type;
    clone.root = this.root;
    clone.children = this.children;
    clone.childrenMap = this.childrenMap;
    clone.options = this.options;
    clone.is = this.is;

    return clone;
  }

  findFieldById(this: UIModelField<unknown>, id: string): UIModelField<unknown> | undefined {
    return id
      .split("-")
      .slice(1)
      .reduce((acc, curr) => acc?.childrenMap?.[curr], this.root as UIModelField<unknown> | undefined);
  }

  deleteChildFieldById(id: string): void {
    if (!(this.isContainer())) return;
    if (!this.children) return;

    const newChildren = this.children.filter((f) => f.id !== id)
    this.updateChildren(newChildren);
  }

  addChildField(option: SchemaOption, position?: number): UIModelField | undefined {
    if (!(this.isContainer())) return;

    const value = this.getEmptyFieldValue(option);

    const childs = this.children || ([] as UIModelField[]);
    const childLength = childs.length;
    const key = this.isArray() ? childLength + "" : option.key;

    const newField = new UIModelField(option.schema, value, key, childLength, this.level + 1, this, this.root);

    if (!newField) return;

    position = position !== undefined ? position : childs.length

    const prev = childs.slice(0, position);
    const next = childs.slice(position);

    const newChildren = [...prev, newField, ...next]
    this.updateChildren(newChildren);

    return newField;
  }

  updateChildren(children: UIModelField[]): void {
    this.children = children
      .map((child, i) => {
        child.index = i;
        return child;
      })
      .sort((a, b) => a.index - b.index);

    this.childrenMap = this.children.reduce((acc, curr) => {
      acc[curr.key] = curr;
      return acc;
    }, {} as Record<string, UIModelField>);
  }

  toValue(): SchemaValue {
    switch (this.type) {
      case "object": {
        return (this.children || []).reduce((acc, field) => {
          acc[field.key] = field.toValue();
          return acc;
        }, {} as Record<string, any>);
      }
      case "array": {
        return (this.children || []).map((field) => field.toValue());
      }
      default: {
        return this.value as SchemaValue;
      }
    }
  }

  toJSON(): string {
    return JSON.stringify(this.toValue(), null, 4);
  }

  getEmptyFieldValue(option: SchemaOption): any {
    let value;

    switch (option.schema.type) {
      case "object": {
        const requiredFields = option.schema.required || [];

        value = requiredFields.reduce((acc, key) => {
          const schema = (option.schema.properties || {})[key] as Schema;
          if ((schema as any).calculated) return acc;

          acc[key] = this.getEmptyFieldValue({ key, schema, required: true });
          return acc;
        }, {} as Record<string, SchemaValue>);

        break;
      }
      case "array": {
        const schema = option.schema.items as Schema;
        const firstItem = this.getEmptyFieldValue({ key: "0", schema, required: false });

        value = [firstItem];

        break;
      }
      case "null": {
        value = null;
        break;
      }
      case "string": {
        value = "";
        break;
      }
      case "integer":
      case "number": {
        value = 0;
        break;
      }
      case "boolean": {
        value = true;
        break;
      }
      case "": {
        value = [];
        break;
      }
    }

    // @note: Handle default values for select types
    const selectOptions = option.schema.oneOf || option.schema.anyOf
    if (selectOptions) {
      value = (selectOptions[0] as any).const;
    }

    return value;
  }

  sortField(position: number) {
    if (!this.parent) return;

    // @note: Field position hasn't changed
    if (this.index === position) return;

    const newChilds = (this.parent.children || ([] as UIModelField[]))
      .sort((a, b) => a.index - b.index)
      .filter((child) => child.index !== this.index);
    // .map(child => {
    //   const newIndex = child.index + (child.index < this.index ? 0 : -1)
    //   child.index = newIndex
    //   return child
    // })

    position += position <= this.index ? 0 : -1;

    console.log("oldChilds", this.parent.children);
    console.log("newChilds", newChilds);

    const prev = newChilds.slice(0, position);
    const next = newChilds.slice(position);

    const newChildren = [...prev, this, ...next]
    this.parent.updateChildren(newChildren);
  }

  getNextFocusableField(): UIModelField | undefined {
    const nextItem = this.parent?.children?.[this.index + 1];
    if (nextItem) return nextItem

    return
  }
}

export type SchemaOption = {
  key: string;
  required: boolean;
  schema: Schema;
};

export type UIModelFieldFlags = {
  root: boolean;
  required: boolean;
  disposable: boolean;
  duplicable: boolean;
  calculated: boolean;
  editable: boolean;
  error: boolean;
  complete: boolean
};

export type UIModelFieldObject<T = unknown> = UIModelField<Record<string, T>> & {
  type: "object";
  children?: UIModelField[];
  childrenMap?: Record<string, UIModelField>;
  deleteChildFieldById: (key: string) => void;
};

export type UIModelFieldArray<T = unknown> = UIModelField<Array<T>> & {
  type: "array";
  children?: UIModelField[];
  childrenMap?: Record<string, UIModelField>;
  deleteChildFieldById: (key: string) => void;
};

export type UIModelRootField = UIModelField<Record<string, any>>;

// export function getParsedSchemaRegistry(): any {
//   return ParsedSchemaRegistry
// }
