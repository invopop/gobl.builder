<script lang="ts">
  import type { SchemaValue } from '$lib/editor/form/utils/schema.js'
  import EditableTextField from './EditableTextField.svelte'
  import { Icon, Pencil } from 'svelte-hero-icons'
  import FieldTitle from './FieldTitle.svelte'
  import type { EditableFieldKeyProps } from '$lib/types/editor'
  import { tick } from 'svelte'
  import { UIModelField } from './utils/model'

  let {
    parseKey = (key) => (key + '').toLowerCase().replace(/[^a-z0-9_-]/g, ''),
    field,
    readOnly = false,
    onFieldKeyUpdated
  }: EditableFieldKeyProps = $props()

  let editing = $state(false)
  let inputValue: SchemaValue = field.key

  function handleEdit(value: SchemaValue) {
    if (!value) return

    inputValue = value
  }

  function handleSave() {
    editing = false

    if (!inputValue) return

    const parsedKey = parseKey(inputValue)
    const result = field.setKey(parsedKey)
    if (!result) return
    onFieldKeyUpdated?.(field)
  }

  async function handleEditing() {
    editing = true
    await tick()
    const el = document.querySelector(`#${field.id}-key`) as HTMLElement
    el.focus()
  }
</script>

<span class="flex items-center justify-start space-x-1 w-full">
  {#if editing}
    <div class="relative w-full">
      <EditableTextField
        field={field as UIModelField<string>}
        id={`${field.id}-key`}
        value={field.key}
        onEdit={handleEdit}
        onBlur={handleSave}
      />
    </div>
  {:else}
    <FieldTitle {field} />
    {#if !readOnly}
      <button onclick={handleEditing}>
        <Icon src={Pencil} class="h-4 w-4 text-foreground-accent" />
      </button>
    {/if}
  {/if}
</span>
