import utf8 from 'utf8'
import base64 from 'base-64'

export function encodeUTF8ToBase64(value: string): string {
  return base64.encode(utf8.encode(value))
}
