import type { NotificationProps } from './types/editor'

export function formatErrors(error: string): string[] {
  // If error does not start with doc: we assume it is a calculation error
  if (!error.startsWith('doc:')) {
    return [error]
  }

  const errors: string[] = []

  const formatted = `(${error})`
    .replace(/\(/g, '{"')
    .replace(/\.\)/g, '}')
    .replace(/([a-z])}/g, '$1"}')
    .replace(/}; /g, '},"')
    .replace(/; /g, '","')
    .replace(/: /g, '":')
    .replace(/:([a-z])/g, ':"$1')

  const parsed = JSON.parse(formatted)

  const readParsedObj = (obj: Record<string, string>, parent = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const parentKey = parent ? `${parent} > ` : ''
      const isNumber = !isNaN(parseFloat(key))
      const formattedKey = isNumber ? parseFloat(key) + 1 : key
      if (typeof value === 'string') {
        errors.push(`${parentKey}${formattedKey}: ${value}`)
      } else {
        readParsedObj(value, `${parentKey}${formattedKey}`)
      }
    }
  }

  readParsedObj(parsed.doc)

  return errors
}

export type GOBLFault = { code?: string; paths?: string[]; message?: string }
export type ParsedGOBLError = { key?: string; faults?: GOBLFault[]; message?: string }

export function formatFaultPath(path: string) {
  if (!path || path === '$') return '$'
  return path.startsWith('$.') ? path.slice(2) : path
}

export function formatFaultMessage(fault: GOBLFault, path: string) {
  const prefix = fault.code ? `[${fault.code}] ` : ''
  return `${prefix}${formatFaultPath(path)}: ${fault.message || ''}`
}

export function parseGOBLError(message: string): ParsedGOBLError | null {
  try {
    return JSON.parse(message)
  } catch {
    return null
  }
}

export function getGOBLErrorMessages(message: string): string[] {
  const parsed = parseGOBLError(message)
  if (!parsed) return [message]

  if (Array.isArray(parsed.faults) && parsed.faults.length > 0) {
    const messages: string[] = []
    for (const fault of parsed.faults) {
      const paths = fault.paths && fault.paths.length > 0 ? fault.paths : ['$']
      for (const path of paths) {
        messages.push(formatFaultMessage(fault, path))
      }
    }
    if (messages.length > 0) return messages
  }

  return [parsed.message || parsed.key || 'Unknown error']
}

export async function displayAllErrors(
  error: string,
  toastFunction?: (notification: NotificationProps) => void
) {
  if (!toastFunction) return
  const errors = getGOBLErrorMessages(error)
  for (const message of errors) {
    toastFunction({ message, type: 'error' })
  }
}

// Reports whether a document still has an empty string anywhere in it, so
// the editor can hold off building until the user has filled in the fields
// they just added. Walks objects and arrays alike: a freshly added array of
// strings (such as `$tags`) starts life as `[""]`, and that empty string
// must be caught as much as one sitting under an object key.
export function objectHasEmptyProperties(value: unknown): boolean {
  if (value === '') return true
  if (typeof value !== 'object' || value === null) return false

  return Object.values(value).some(objectHasEmptyProperties)
}

export function getAgentSystem() {
  if (!('navigator' in window)) {
    return 'unknown'
  }

  if (navigator.userAgent.indexOf('Win') > -1) return 'windows'
  if (navigator.userAgent.indexOf('Mac') > -1) return 'mac'
  if (navigator.userAgent.indexOf('Linux') > -1) return 'linux'
  if (navigator.userAgent.indexOf('Android') > -1) return 'android'
  if (navigator.userAgent.indexOf('like Mac') > -1) return 'ios'

  return 'unknown'
}
