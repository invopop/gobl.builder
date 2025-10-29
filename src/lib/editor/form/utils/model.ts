import { tick } from "svelte";
import { getRootSchema, parseSchema, type Schema, type SchemaValue } from "./schema.js";
import { sleep } from "./sleep.js";

export async function generateCorrectOptionsModel(schema: string) {
  const schemaObj = JSON.parse(schema);
  const options = schemaObj.$defs.CorrectionOptions;
  const parsedSchema = await parseSchema(schemaObj.$id, options, schemaObj);

  const CORRECTION_OPTIONS_SCHEMA_URL = "https://gobl.org/draft-0/bill/correction-options?tax_regime=";
  const country = schemaObj.$id?.replace(CORRECTION_OPTIONS_SCHEMA_URL, "");

  parsedSchema.title = `Correction Options ${country ? `[${country}]` : ""}`;

  return getUIModel(parsedSchema as Schema, "");
}

export async function getUIModel<V extends SchemaValue>(
  schema: Schema | string,
  value: V,
  uniqueId: string | undefined = undefined,
): Promise<UIModelField<V> | undefined> {
  schema = typeof schema === "string" ? await getRootSchema(schema, value) : schema;
  if (!schema) return;

  return new UIModelField<V>(schema, value, uniqueId);
}

export class UIModelField<V extends SchemaValue | unknown = unknown> {
  public id: string;
  public type: string;
  public controlType?: ControlType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public controlMeta?: any;
  public root!: UIModelRootField;
  public children?: UIModelField[];
  public childrenMap?: Record<string, UIModelField>;
  public options?: SchemaOption[];
  public is: UIModelFieldFlags;

  constructor(
    public schema: Schema,
    public value: V,
    public uniqueId: string = "",
    public key: string = String(schema.$id?.split("/").slice(-1)[0] || "root").toLowerCase(),
    public index: number = 0,
    public level: number = 0,
    public parent?: UIModelField,
    root?: UIModelRootField,
  ) {
    this.id = `${this.parent?.id ? `${this.parent.id}` : `${this.uniqueId}`}-${this.key}`.replace(
      /[^a-zA-Z0-9-_]/g,
      "",
    );
    this.type = this.schema.type as string;
    this.controlType = this.getControlType();
    this.controlMeta = this.getControlMeta();
    this.root = !root ? (this as UIModelRootField) : root;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calculated = (this.schema as any)?.calculated || this.parent?.is.calculated;

    this.is = {
      required: !!this.key && (this.parent?.schema.required || []).includes(this.key),
      root: !root,
      disposable: !!root && this.key !== "$schema",
      duplicable: this.parent?.type === "array" || this.parent?.controlType === "dictionary",
      calculated: calculated,
      editable: true,
      editableKey: this.parent?.controlType === "dictionary",
      complete: false,
      empty: true,
    };

    if (this.is.root) {
      const keys = this.value && (Object.entries(this.value) || []);
      // eslint-disable-next-line
      const emptyModelWithSchema = keys.length === 1 && !!(this.value as any).$schema;

      if (!this.value || emptyModelWithSchema) {
        const emptyValue = this.getEmptyFieldValue({ key: this.key, schema: this.schema, required: true });

        this.value = {
          $schema: this.schema.$id,
          ...emptyValue,
        };
      }
    }

    switch (this.schema.type) {
      case "object": {
        const items = Object.entries((this.value || {}) as Record<string, SchemaValue>);
        let index = 0;

        for (const [key, value] of items) {
          const subSchema =
            this.controlType === "dictionary"
              ? this.controlMeta.schema
              : (this.schema.properties?.[key] as Schema | undefined);

          if (!subSchema) continue;

          const childUIModelField = new UIModelField(
            subSchema,
            value,
            this.root.uniqueId,
            key,
            index,
            this.level + 1,
            this,
            this.root,
          );

          if (!childUIModelField) continue;
          index++;

          this.children = this.children || [];
          this.childrenMap = this.childrenMap || {};
          this.children.push(childUIModelField);
          this.childrenMap[key] = childUIModelField;
        }

        this.options =
          this.controlType === "dictionary"
            ? [this.controlMeta]
            : Object.entries(this.schema.properties || {})
                .map<SchemaOption>(([key, subSchema]) => ({
                  key,
                  required: ((this.schema as Schema).required || []).includes(key),
                  schema: subSchema as Schema,
                }))
                .filter((opt) => (this.value as Record<string, unknown>)?.[opt.key] === undefined);

        break;
      }
      case "array": {
        // @todo: Support multiple types (Schema[])
        const subSchema = this.schema.items as Schema | undefined;
        if (!subSchema) break;

        const items = ((this.value || []) as SchemaValue[]).entries();
        let index = 0;

        for (const [k, value] of items) {
          const key = k + "";
          const childUIModelField = new UIModelField(
            subSchema,
            value,
            this.root.uniqueId,
            key,
            index,
            this.level + 1,
            this,
            this.root,
          );

          if (!childUIModelField) continue;
          index++;

          this.children = this.children || [];
          this.childrenMap = this.childrenMap || {};
          this.children.push(childUIModelField);
          this.childrenMap[key] = childUIModelField;
        }

        this.options = [
          {
            key: `item`,
            required: (this.schema.required || []).includes(this.key),
            schema: subSchema,
          },
        ];

        break;
      }
    }

    this.is.complete = (this.options || []).length === 0;
    this.is.empty = this.isContainer()
      ? (this.children || []).length === 0 && !this.is.complete
      : this.value === undefined;
  }

  isObject(this: UIModelField<unknown>): this is UIModelFieldObject {
    return this.type === "object";
  }

  isArray(this: UIModelField<unknown>): this is UIModelFieldArray {
    return this.type === "array";
  }

  isContainer(this: UIModelField<unknown>): this is UIModelFieldArray | UIModelFieldObject {
    return this.isArray() || this.isObject();
  }

  findFieldById(this: UIModelField<unknown>, id: string): UIModelField<unknown> | undefined {
    return id
      .split("-")
      .slice(1)
      .reduce((acc, curr) => acc?.childrenMap?.[curr], this.root as UIModelField<unknown> | undefined);
  }

  setKey(key: string): boolean {
    if (!this.is.editableKey) return false;
    if (!this.parent) return false;
    if (this.key === key) return false;

    // Force reactivity updates before recreation
    this.key = key;

    this.parent.deleteChildFieldById(this.id);
    this.parent.addChildField({ key, required: this.is.required, schema: this.schema }, this.value);

    return true;
  }

  setValue(value: V): boolean {
    if (!this.is.editable) return false;
    if (this.value === value) return false;

    this.value = value;
    return true;
  }

  delete(): boolean {
    if (this.is.root) return false;
    if (!this.parent) return false;

    return this.parent.deleteChildFieldById(this.id);
  }

  deleteChildFieldById(id: string): boolean {
    if (!this.isContainer()) return false;
    if (!this.children) return false;

    const newChildren = this.children.filter((f) => f.id !== id);
    if (this.children.length <= newChildren.length) return false;

    // Adds back the field to parent options
    const field = this.children.find((f) => f.id === id);
    this.options?.splice(Number(field?.index), 0, {
      key: field?.key || "",
      required: field?.is.required || false,
      schema: field?.schema as Schema,
    });

    this.updateChildren(newChildren);
    return true;
  }

  duplicate(): UIModelField | undefined {
    if (this.is.root) return;
    if (!this.parent) return;
    if (!this.parent.isContainer()) return;

    const key = this.parent.getNextChildFieldKey(this.key);
    return this.parent.addChildField({ key, required: this.is.required, schema: this.schema }, this.value);
  }

  getNextChildFieldKey(key: string): string {
    if (!this.isContainer()) return key;

    const childs = this.children || ([] as UIModelField[]);
    let newKey = key;

    if (this.isObject()) {
      const keyMap = childs.reduce(
        (acc, curr) => {
          acc[curr.key] = curr;
          return acc;
        },
        {} as Record<string, unknown>,
      );

      let n = 0;
      while (keyMap[newKey]) {
        newKey = `${key}${++n}`;
      }
    }

    if (this.isArray()) {
      newKey = childs.length + "";
    }

    return newKey;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addChildField(option: SchemaOption, defaultValue?: any, position?: number): UIModelField | undefined {
    if (!this.isContainer()) return;
    if (this.is.complete) return;

    const value = defaultValue || this.getEmptyFieldValue(option);

    const childs = this.children || ([] as UIModelField[]);
    const childsMap = this.childrenMap || ({} as Record<string, UIModelField>);
    const childLength = childs.length;
    const key = this.getNextChildFieldKey(option.key);

    const newField = new UIModelField(
      option.schema,
      value,
      this.root.uniqueId,
      key,
      childLength,
      this.level + 1,
      this,
      this.root,
    );

    if (!newField) return;

    // @note: If the position is not provided, use the default position inside the container
    if (position === undefined) {
      if (this.isArray() || (this.isObject() && this.controlType === "dictionary")) {
        position = childs.length;
      } else if (this.isObject()) {
        let count = 0;
        const schemaSortedKeys = Object.keys(this.schema.properties || {});
        for (const key of schemaSortedKeys) {
          if (key === option.key) break;
          if (childsMap[key]) count++;
        }
        position = count;
      }
    }

    const prev = childs.slice(0, position);
    const next = childs.slice(position);

    const newChildren = [...prev, newField, ...next];
    this.updateChildren(newChildren);

    // Removes the just added child from the suggestion options
    this.options = this.options?.filter((o) => {
      return o.key !== newField.key;
    });

    return newField;
  }

  updateChildren(children: UIModelField[]): void {
    this.children = children
      .map((child, i) => {
        child.index = i;
        return child;
      })
      .sort((a, b) => a.index - b.index);

    this.childrenMap = this.children.reduce(
      (acc, curr) => {
        acc[curr.key] = curr;
        return acc;
      },
      {} as Record<string, UIModelField>,
    );
  }

  toValue(): SchemaValue {
    switch (this.type) {
      case "object": {
        return (this.children || []).reduce(
          (acc, field) => {
            acc[field.key] = field.toValue();
            return acc;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {} as Record<string, any>,
        );
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

  sortField(position: number): string | undefined {
    if (!this.parent) return;
    if ((this.parent.children?.length || 1) === 1) return;

    // @note: Field position hasn't changed
    if (this.index === position) return;

    const sortedChilds = (this.parent.children || ([] as UIModelField[])).sort((a, b) => a.index - b.index);

    const newChilds = sortedChilds.filter((child) => child.index !== this.index);

    position += position <= this.index ? 0 : -1;

    const prev = newChilds.slice(0, position);
    const next = newChilds.slice(position);

    const newChildren = [...prev, this, ...next];
    this.parent.updateChildren(newChildren);

    return this.parent.type === "array" ? sortedChilds[position].id : this.id;
  }

  move(direction: "up" | "down") {
    const swapPositions = (array: UIModelField[], a: number, b: number) => {
      array[a].key = String(b);
      array[b].key = String(a);
      [array[a], array[b]] = [array[b], array[a]];
    };

    const children = this.parent?.children || [];

    const factor = direction === "down" ? 1 : -1;

    const currentKey = Number(this.key);
    const destinationKey = currentKey + factor;

    if (destinationKey < 0 || destinationKey >= children.length) return;

    swapPositions(children, currentKey, destinationKey);

    return children[currentKey];
  }

  getNextFocusableField(reverse = false): UIModelField | undefined {
    if (this.is.root) {
      return this.getFirstFocusableChild(reverse);
    }

    if (!this.parent) return this.root;

    let childs = this.parent.children || [];
    childs = reverse ? childs.slice(0, this.index).reverse() : childs.slice(this.index + 1);

    for (const item of childs) {
      const focusableField = item.getFirstFocusableChild(reverse);
      if (focusableField) return focusableField;
    }

    if (this.parent.is.root) return this.root;
    return this.parent.getNextFocusableField(reverse);
  }

  getPrevFocusableField(): UIModelField | undefined {
    return this.getNextFocusableField(true);
  }

  getFirstFocusableChild(reverse = false): UIModelField | undefined {
    if (!this.isContainer() || this.is.empty) return this;

    let childs = this.children || [];
    childs = reverse ? childs.slice().reverse() : childs;

    for (const item of childs) {
      if (item.is.calculated) continue;

      const focusable = item.getFirstFocusableChild(reverse);
      if (focusable) return focusable;
    }

    return;
  }

  getLastFocusableChild(): UIModelField | undefined {
    return this.getFirstFocusableChild(true);
  }

  async tryFocus(retries = 5, delay = 200): Promise<boolean> {
    await tick();

    while (--retries > 0) {
      await sleep(delay);

      const elementToFocus = this.getFirstFocusableChild();

      const el = document.querySelector(`#${elementToFocus?.id}`) as HTMLElement;
      if (!el) continue;

      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();

      return true;
    }

    return false;
  }

  getControlType(schema: Schema = this.schema): ControlType | undefined {
    const isSelect = "oneOf" in schema || "anyOf" in schema;
    if (isSelect) return "select";

    const isDate = schema.format === "date";
    if (isDate) return "date";

    const isText = schema.type === "string";
    if (isText) return "text";

    const isDictionary = "patternProperties" in schema;
    if (isDictionary) return "dictionary";
  }

  getControlMeta(schema: Schema = this.schema): unknown | undefined {
    const controlType = this.getControlType(schema);

    if (controlType === "select") {
      let options: { label: string; value: string }[] = [];

      if ("oneOf" in schema) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options = (schema.oneOf || []).map((v: any) => ({ label: v.title || v.description, value: v.const }));
      }

      if ("anyOf" in schema) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options = (schema.anyOf || []).map((v: any) => ({ label: v.title || v.description, value: v.const }));
      }

      return [
        { label: "", value: "" },
        ...options.sort((a, b) => {
          const aLabel = a.label || "";
          const bLabel = b.label || "";

          return aLabel.localeCompare(bLabel);
        }),
      ];
    }

    if (controlType === "dictionary" && !!schema.patternProperties?.[".*"]) {
      const subSchema = schema.patternProperties[".*"];
      return { key: `key`, required: false, schema: subSchema };
    }

    if (controlType === "dictionary") {
      return { key: `key`, required: false, schema: { type: "string" } };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEmptyFieldValue(option: SchemaOption, nestingLevel: number = Number.POSITIVE_INFINITY): any {
    let value;

    switch (option.schema?.type) {
      case "object": {
        const recommendedFields = option.schema.recommended || [];
        const requiredFields = option.schema.required || [];
        const displayFields = [...recommendedFields, ...requiredFields];

        value = displayFields.reduce(
          (acc, key) => {
            const schema = (option.schema.properties || {})[key] as Schema;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((schema as any)?.calculated) return acc;

            acc[key] = this.getEmptyFieldValue({ key, schema, required: true }, --nestingLevel);
            return acc;
          },
          {} as Record<string, SchemaValue>,
        );

        break;
      }
      case "array": {
        const schema = option.schema.items as Schema;
        const firstItem = this.getEmptyFieldValue({ key: "0", schema, required: false }, --nestingLevel);

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
    }

    // @note: Override default values of specific form control types
    const controlType = this.getControlType(option.schema);

    switch (controlType) {
      case "date": {
        value = new Date().toISOString().split("T")[0];
        break;
      }
      case "dictionary": {
        const childOption = this.getControlMeta(option.schema) as SchemaOption;
        value = { key: childOption ? this.getEmptyFieldValue(childOption) : "" };
        break;
      }
    }

    return value;
  }
}

export type ControlType = "text" | "select" | "date" | "dictionary";

export type SchemaOption = {
  key: string;
  required: boolean;
  schema: Schema & { calculated?: boolean; recommended?: string[] };
};

export type UIModelFieldFlags = {
  root: boolean;
  required: boolean;
  disposable: boolean;
  duplicable: boolean;
  calculated: boolean;
  editableKey: boolean;
  editable: boolean;
  // error: boolean;
  complete: boolean;
  empty: boolean;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UIModelRootField = UIModelField<Record<string, any> | Error>;
