import type { GOBLError } from '@invopop/gobl-worker'
import { formatFaultMessage, parseGOBLError } from '$lib/helpers'
import { parseJSONPath } from '$lib/editor/code/faultLocator'
import type { UIModelField } from './model'

export type FaultIndex = Map<string, string[]>

/**
 * Walk the parent chain of a UIModelField (excluding the root) and return the
 * JSON Path segment list that identifies it inside the document. Array
 * children become numeric segments to match how GOBL's fault paths encode
 * them (`lines[0]` → 0 rather than "0").
 */
export function fieldPathSegments(field: UIModelField): (string | number)[] {
  const segments: (string | number)[] = []
  let current: UIModelField | undefined = field
  while (current && !current.is.root) {
    const parent: UIModelField | undefined = current.parent
    if (parent?.type === 'array') {
      segments.unshift(Number(current.key))
    } else {
      segments.unshift(current.key)
    }
    current = parent
  }
  return segments
}

/**
 * Produce a stable string key from a segment list so two segment arrays with
 * matching content compare equal as Map keys.
 */
export function canonicalPathKey(segments: (string | number)[]): string {
  return segments.map((s) => String(s)).join('/')
}

function walkFieldTree(root: UIModelField): Set<string> {
  const keys = new Set<string>()
  keys.add(canonicalPathKey([]))

  function visit(field: UIModelField, segs: (string | number)[]) {
    for (const child of field.children || []) {
      const childSegs = field.type === 'array' ? [...segs, Number(child.key)] : [...segs, child.key]
      keys.add(canonicalPathKey(childSegs))
      visit(child, childSegs)
    }
  }
  visit(root, [])
  return keys
}

/**
 * Build a `canonicalKey -> string[]` map from the current goblError so each
 * form field can look up the fault messages that apply to it.
 *
 * Handles two path-alignment concerns:
 *  - GOBL fault paths are rooted at the envelope (`$.doc.foo`), but the form
 *    may be editing a bare document where the root has no `doc` / `head`
 *    child. Strip the leading envelope segment in that case.
 *  - A fault path may reference a field that doesn't exist yet in the form
 *    tree (e.g. a missing required field). Walk the segments back to the
 *    nearest existing ancestor and attach the message there so it remains
 *    visible.
 */
export function buildFaultIndex(
  goblError: GOBLError | null | undefined,
  root: UIModelField | undefined
): FaultIndex {
  const index: FaultIndex = new Map()
  if (!goblError || !root) return index

  const parsed = parseGOBLError(goblError.message)
  if (!parsed?.faults?.length) return index

  const existingKeys = walkFieldTree(root)
  const rootHasDoc = Boolean(root.childrenMap?.doc)
  const rootHasHead = Boolean(root.childrenMap?.head)

  for (const fault of parsed.faults) {
    const paths = fault.paths && fault.paths.length > 0 ? fault.paths : ['$']
    for (const path of paths) {
      let segments = parseJSONPath(path)
      if (segments.length > 0 && !rootHasDoc && segments[0] === 'doc') {
        segments = segments.slice(1)
      }
      if (segments.length > 0 && !rootHasHead && segments[0] === 'head') {
        segments = segments.slice(1)
      }

      // Walk up to the nearest existing field so messages are never lost.
      let key = canonicalPathKey(segments)
      while (segments.length > 0 && !existingKeys.has(key)) {
        segments = segments.slice(0, -1)
        key = canonicalPathKey(segments)
      }

      const message = formatFaultMessage(fault, path)
      const list = index.get(key)
      if (list) {
        list.push(message)
      } else {
        index.set(key, [message])
      }
    }
  }

  return index
}
