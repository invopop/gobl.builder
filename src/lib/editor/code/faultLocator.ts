import type * as Monaco from 'monaco-editor'
import { findNodeAtLocation, parseTree, type Node as JSONNode } from 'jsonc-parser'

export type FaultRange = {
  startLineNumber: number
  startColumn: number
  endLineNumber: number
  endColumn: number
}

const DEFAULT_RANGE: FaultRange = {
  startLineNumber: 1,
  startColumn: 1,
  endLineNumber: 1,
  endColumn: 1
}

/**
 * Convert a GOBL JSON Path string (e.g. "$.doc.lines[0].item.name") into an
 * array of segments consumable by jsonc-parser's findNodeAtLocation.
 *
 * Root path ("$" or empty) returns an empty array.
 */
export function parseJSONPath(path: string): (string | number)[] {
  if (!path || path === '$') return []
  const body = path.replace(/^\$\.?/, '')
  const segments: (string | number)[] = []
  const tokenRe = /([^.[\]]+)|\[(\d+)\]/g
  let match: RegExpExecArray | null
  while ((match = tokenRe.exec(body)) !== null) {
    if (match[2] !== undefined) {
      segments.push(Number(match[2]))
    } else {
      segments.push(match[1])
    }
  }
  return segments
}

function nodeToRange(node: JSONNode, model: Monaco.editor.ITextModel): FaultRange {
  const start = model.getPositionAt(node.offset)
  const end = model.getPositionAt(node.offset + node.length)
  return {
    startLineNumber: start.lineNumber,
    startColumn: start.column,
    endLineNumber: end.lineNumber,
    endColumn: end.column
  }
}

/**
 * Resolve a fault path to a Monaco range within the given JSON source.
 *
 * If the exact node isn't found (e.g. a missing required field, or the editor
 * text has drifted from the validated payload), walks up the path to the
 * nearest existing ancestor so the marker still points near the offending
 * area. Falls back to line 1 col 1 when nothing resolves.
 */
/**
 * Adjust fault path segments to match the editor content's actual root.
 *
 * Fault paths are rooted at the envelope (e.g. `$.doc.supplier.tax_id.code`),
 * but when the user is editing a bare document the editor root IS the
 * document. Strip the leading `doc` / `head` segment if the root has no such
 * property, so paths still locate inside the bare document.
 */
function adjustSegmentsForRoot(root: JSONNode, segments: (string | number)[]): (string | number)[] {
  if (segments.length === 0) return segments
  if (root.type !== 'object') return segments
  const head = segments[0]
  if (head !== 'doc' && head !== 'head') return segments
  const hasProperty = (root.children ?? []).some((prop) => {
    const keyNode = prop.children?.[0]
    return keyNode?.value === head
  })
  return hasProperty ? segments : segments.slice(1)
}

export function resolveFaultRange(
  model: Monaco.editor.ITextModel,
  root: JSONNode | undefined,
  path: string
): FaultRange {
  if (!root) return DEFAULT_RANGE

  const segments = adjustSegmentsForRoot(root, parseJSONPath(path))
  if (segments.length === 0) return DEFAULT_RANGE

  const node = findNodeAtLocation(root, segments)
  if (node) return nodeToRange(node, model)

  // Walk up the path to find the closest parent that does exist.
  for (let i = segments.length - 1; i > 0; i--) {
    const parent = findNodeAtLocation(root, segments.slice(0, i))
    if (parent) return nodeToRange(parent, model)
  }

  return DEFAULT_RANGE
}

/**
 * Parse the JSON source once; pass the result to resolveFaultRange for each
 * fault path in a batch to avoid re-parsing per marker.
 */
export function parseSource(source: string): JSONNode | undefined {
  try {
    return parseTree(source)
  } catch {
    return undefined
  }
}
