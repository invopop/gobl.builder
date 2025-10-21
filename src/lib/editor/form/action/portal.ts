import { tick } from 'svelte'

const portalHosts = new Map()

export function createPortal(node: HTMLElement, id = 'default') {
  const key = `$$portal.${id}`

  if (portalHosts.has(key)) throw `duplicate portal key "${id}"`
  else portalHosts.set(key, node)

  return { destroy: portalHosts.delete.bind(portalHosts, key) }
}

function mount(node: HTMLElement, key: string) {
  if (!portalHosts.has(key)) throw `unknown portal ${key}`

  const host = portalHosts.get(key)
  host.insertBefore(node, null)

  return () => host.contains(node) && host.removeChild(node)
}

export function portal(node: HTMLElement, id = 'default') {
  let destroy: () => void

  const key = `$$portal.${id}`

  if (!portalHosts.has(key))
    tick().then(() => {
      destroy = mount(node, key)
    })
  else destroy = mount(node, key)

  return { destroy: () => destroy?.() }
}
