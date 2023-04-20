import { getRootSchema, type Schema, type SchemaValue } from "./schema.js"

export async function getUIModel<V extends SchemaValue>(
  schema: Schema | string,
  value: V
): Promise<UIModelField<V> | undefined> {
  schema = typeof schema === "string" ? await getRootSchema(schema) : schema
  if (!schema) return

  return new UIModelField<V>(schema, value)
}

export class UIModelField<V extends SchemaValue | unknown = unknown> {
  public id: string
  public type: string
  public controlType?: ControlType
  public controlMeta?: any
  public root!: UIModelRootField
  public children?: UIModelField[]
  public childrenMap?: Record<string, UIModelField>
  public options?: SchemaOption[]
  public error?: Error
  public is: UIModelFieldFlags

  constructor(
    public schema: Schema,
    public value: V,
    public key: string = String(schema.$id?.split("/").slice(-1)[0] || "root").toLowerCase(),
    public index: number = 0,
    public level: number = 0,
    public parent?: UIModelField,
    root?: UIModelRootField
  ) {
    this.id = `${this.parent?.id ? `${this.parent.id}-` : ""}${this.key}`.replace(/[^a-zA-Z0-9-_\\$]/g, "")
    this.type = this.schema.type as string
    this.controlType = this.getControlType()
    this.controlMeta = this.getControlMeta()
    this.root = !root ? (this as UIModelRootField) : root
    this.error = value instanceof Error ? value : undefined

    const calculated = (this.schema as any).calculated || this.parent?.is.calculated

    this.is = {
      required: !!this.key && (this.parent?.schema.required || []).includes(this.key),
      root: !root,
      disposable: !!root && this.key !== '$schema',
      duplicable: this.parent?.type === "array" || this.parent?.controlType === 'dictionary',
      calculated: calculated,
      editable: !calculated,
      editableKey: !calculated && this.parent?.controlType === 'dictionary',
      error: (value instanceof Error),
      complete: false
    }

    if (this.is.root && !this.value) {
      const emptyValue = this.getEmptyFieldValue({ key: this.key, schema: this.schema, required: true })

      this.value = {
        $schema: this.schema.$id,
        ...emptyValue
      }
    }

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

    switch (this.schema.type) {
      case "object": {
        const items = Object.entries((this.value || {}) as Record<string, SchemaValue>)
        let index = 0

        for (const [key, value] of items) {
          const subSchema = this.controlType === 'dictionary'
            ? this.controlMeta.schema
            : this.schema.properties?.[key] as Schema | undefined

          if (!subSchema) continue

          const childUIModelField = new UIModelField(subSchema, value, key, index, this.level + 1, this, this.root)

          if (!childUIModelField) continue
          index++

          this.children = this.children || []
          this.childrenMap = this.childrenMap || {}
          this.children.push(childUIModelField)
          this.childrenMap[key] = childUIModelField
        }

        this.options = this.controlType === 'dictionary' ? [
          this.controlMeta
        ] :
          Object.entries(this.schema.properties || {})
            .map<SchemaOption>(([key, subSchema]) => ({
              key,
              required: ((this.schema as Schema).required || []).includes(key),
              schema: subSchema as Schema,
            }))
            .filter((opt) => !(opt.schema as any).calculated)
            .filter((opt) => (this.value as Record<string, unknown>)?.[opt.key] === undefined)

        break
      }
      case "array": {
        // @todo: Support multiple types (Schema[])
        const subSchema = this.schema.items as Schema | undefined
        if (!subSchema) break

        const items = ((this.value || []) as SchemaValue[]).entries()
        let index = 0

        for (const [k, value] of items) {
          const key = k + ''
          const childUIModelField = new UIModelField(subSchema, value, key, index, this.level + 1, this, this.root)

          if (!childUIModelField) continue
          index++

          this.children = this.children || []
          this.childrenMap = this.childrenMap || {}
          this.children.push(childUIModelField)
          this.childrenMap[key] = childUIModelField
        }

        this.options = [
          {
            key: `item`,
            required: (this.schema.required || []).includes(this.key),
            schema: subSchema,
          },
        ]

        break
      }
    }

    this.is.complete = (this.options || []).length === 0
  }

  isObject(this: UIModelField<unknown>): this is UIModelFieldObject {
    return this.type === "object"
  }

  isArray(this: UIModelField<unknown>): this is UIModelFieldArray {
    return this.type === "array"
  }

  isContainer(this: UIModelField<unknown>): this is UIModelFieldArray | UIModelFieldObject {
    return this.isArray() || this.isObject()
  }

  findFieldById(this: UIModelField<unknown>, id: string): UIModelField<unknown> | undefined {
    return id
      .split("-")
      .slice(1)
      .reduce((acc, curr) => acc?.childrenMap?.[curr], this.root as UIModelField<unknown> | undefined)
  }

  setKey(key: string): boolean {
    if (!this.is.editableKey) return false
    if (!this.parent) return false
    if (this.key === key) return false

    this.parent.deleteChildFieldById(this.id)
    this.parent.addChildField({ key, required: this.is.required, schema: this.schema }, this.value)

    return true
  }

  setValue(value: V): boolean {
    if (!this.is.editable) return false
    if (this.value === value) return false

    this.value = value
    return true
  }

  delete(): boolean {
    if (this.is.root) return false
    if (!this.parent) return false

    return this.parent.deleteChildFieldById(this.id)
  }

  deleteChildFieldById(id: string): boolean {
    if (!(this.isContainer())) return false
    if (!this.children) return false

    const newChildren = this.children.filter((f) => f.id !== id)
    if (this.children.length <= newChildren.length) return false

    this.updateChildren(newChildren)
    return true
  }

  duplicate(): UIModelField | undefined {
    if (this.is.root) return
    if (!this.parent) return
    if (!this.parent.isContainer()) return

    const key = this.parent.getNextChildFieldKey(this.key)
    return this.parent.addChildField({ key, required: this.is.required, schema: this.schema }, this.value)
  }

  getNextChildFieldKey(key: string): string {
    if (!this.isContainer()) return key

    const childs = this.children || ([] as UIModelField[])
    let newKey = key

    if (this.isObject()) {
      const keyMap = childs.reduce((acc, curr) => {
        acc[curr.key] = curr
        return acc
      }, {} as Record<string, unknown>)

      let n = 0
      while (keyMap[newKey]) {
        newKey = `${key}${++n}`
      }
    }

    if (this.isArray()) {
      newKey = childs.length + ""
    }

    return newKey
  }

  addChildField(option: SchemaOption, defaultValue?: any, position?: number): UIModelField | undefined {
    if (!(this.isContainer())) return
    if (this.is.complete) return

    const value = defaultValue || this.getEmptyFieldValue(option)

    const childs = this.children || ([] as UIModelField[])
    const childLength = childs.length
    const key = this.getNextChildFieldKey(option.key)

    const newField = new UIModelField(option.schema, value, key, childLength, this.level + 1, this, this.root)

    if (!newField) return

    position = position !== undefined ? position : childs.length

    const prev = childs.slice(0, position)
    const next = childs.slice(position)

    const newChildren = [...prev, newField, ...next]
    this.updateChildren(newChildren)

    return newField
  }

  updateChildren(children: UIModelField[]): void {
    this.children = children
      .map((child, i) => {
        child.index = i
        return child
      })
      .sort((a, b) => a.index - b.index)

    this.childrenMap = this.children.reduce((acc, curr) => {
      acc[curr.key] = curr
      return acc
    }, {} as Record<string, UIModelField>)
  }

  toValue(): SchemaValue {
    switch (this.type) {
      case "object": {
        return (this.children || []).reduce((acc, field) => {
          acc[field.key] = field.toValue()
          return acc
        }, {} as Record<string, any>)
      }
      case "array": {
        return (this.children || []).map((field) => field.toValue())
      }
      default: {
        return this.value as SchemaValue
      }
    }
  }

  toJSON(): string {
    return JSON.stringify(this.toValue(), null, 4)
  }

  sortField(position: number): string | undefined {
    if (!this.parent) return

    // @note: Field position hasn't changed
    if (this.index === position) return

    const sortedChilds = (this.parent.children || ([] as UIModelField[]))
      .sort((a, b) => a.index - b.index)

    const newChilds = sortedChilds
      .filter((child) => child.index !== this.index)

    position += position <= this.index ? 0 : -1

    const prev = newChilds.slice(0, position)
    const next = newChilds.slice(position)

    const newChildren = [...prev, this, ...next]
    this.parent.updateChildren(newChildren)

    return (this.parent.type === 'array')
      ? sortedChilds[position].id
      : this.id
  }

  getNextFocusableField(): UIModelField | undefined {
    const nextItem = this.parent?.children?.[this.index + 1]
    if (nextItem) return nextItem

    return
  }

  getControlType(schema: Schema = this.schema): ControlType | undefined {
    const isSelect = 'oneOf' in schema || 'anyOf' in schema
    if (isSelect) return 'select'

    const isDate = schema.format === 'date'
    if (isDate) return 'date'

    const isText = schema.type === 'string'
    if (isText) return 'text'

    const isDictionary = 'patternProperties' in schema
    if (isDictionary) return 'dictionary'
  }

  getControlMeta(schema: Schema = this.schema): unknown | undefined {
    const controlType = this.getControlType(schema)

    if (controlType === 'select') {
      if ('oneOf' in schema) {
        return (schema.oneOf || []).map((v: any) => ({ key: v.description, value: v.const }))
      }

      if ('anyOf' in schema) {
        return (schema.anyOf || []).map((v: any) => ({ key: v.description, value: v.const }))
      }
    }

    if (controlType === 'dictionary' && !!schema.patternProperties?.['.*']) {
      const subSchema = schema.patternProperties['.*']
      return { key: `key`, required: false, schema: subSchema }
    }
  }

  getEmptyFieldValue(option: SchemaOption, nestingLevel: number = Number.POSITIVE_INFINITY): any {
    let value

    switch (option.schema.type) {
      case "object": {
        const requiredFields = option.schema.required || []

        value = requiredFields.reduce((acc, key) => {
          const schema = (option.schema.properties || {})[key] as Schema
          if ((schema as any).calculated) return acc

          acc[key] = this.getEmptyFieldValue({ key, schema, required: true }, --nestingLevel)
          return acc
        }, {} as Record<string, SchemaValue>)

        break
      }
      case "array": {
        const schema = option.schema.items as Schema
        const firstItem = this.getEmptyFieldValue({ key: "0", schema, required: false }, --nestingLevel)

        value = [firstItem]

        break
      }
      case "null": {
        value = null
        break
      }
      case "string": {
        value = ""
        break
      }
      case "integer":
      case "number": {
        value = 0
        break
      }
      case "boolean": {
        value = true
        break
      }
      case "": {
        value = []
        break
      }
    }

    // @note: Override default values of specific form control types
    const controlType = this.getControlType(option.schema)

    switch (controlType) {
      case 'date': {
        value = (new Date()).toISOString().split('T')[0]
        break
      }
      case 'select': {
        const [firstOption] = this.getControlMeta(option.schema) as { key: string, value: string }[]
        value = firstOption.value
        break
      }
      case 'dictionary': {
        const childOption = this.getControlMeta(option.schema) as SchemaOption
        value = { key: this.getEmptyFieldValue(childOption) }
        break
      }
    }

    return value
  }
}

export type ControlType = 'text' | 'select' | 'date' | 'dictionary'

export type SchemaOption = {
  key: string
  required: boolean
  schema: Schema
}

export type UIModelFieldFlags = {
  root: boolean
  required: boolean
  disposable: boolean
  duplicable: boolean
  calculated: boolean
  editableKey: boolean
  editable: boolean
  error: boolean
  complete: boolean
}

export type UIModelFieldObject<T = unknown> = UIModelField<Record<string, T>> & {
  type: "object"
  children?: UIModelField[]
  childrenMap?: Record<string, UIModelField>
  deleteChildFieldById: (key: string) => void
}

export type UIModelFieldArray<T = unknown> = UIModelField<Array<T>> & {
  type: "array"
  children?: UIModelField[]
  childrenMap?: Record<string, UIModelField>
  deleteChildFieldById: (key: string) => void
}

export type UIModelRootField = UIModelField<Record<string, any> | Error>
