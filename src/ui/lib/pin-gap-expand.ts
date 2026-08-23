/** Keep a hunk-gap separator under the cursor after Pierre inserts lines above it. */

const STALE_MS = 2000
const ALIGN_PX = 2
const ALIGNED_FRAMES = 2

export type GapPin = {
  scroller: HTMLElement
  top: number
  index: string
  scrollHeight: number
  createdAt: number
}

export function gapSeparator(path: readonly EventTarget[]): HTMLElement | undefined {
  for (const node of path) {
    if (!hasClosest(node)) continue
    const sep = node.closest("[data-expand-index]")
    if (isBox(sep)) return sep
  }
}

/** Pierre Shift+click and the count / expand-all control insert above. A plain ↓ does not. */
export function isPlainDownClick(path: readonly EventTarget[], shiftKey: boolean): boolean {
  if (shiftKey) return false
  for (const node of path) {
    if (!hasClosest(node)) continue
    if (node.closest("[data-expand-all-button]")) return false
    if (node.closest("[data-expand-down]")) return true
  }
  return false
}

export function reviewScroller(from: Element): HTMLElement | undefined {
  const main = from.closest("main")
  return main instanceof HTMLElement ? main : undefined
}

export function adjustScroll(scroller: HTMLElement, delta: number): void {
  if (delta === 0) return
  const { style } = scroller
  const prev = style.scrollBehavior
  style.scrollBehavior = "auto"
  scroller.scrollTop += delta
  style.scrollBehavior = prev
}

export function settleGapPin(pin: GapPin, host: HTMLElement): "wait" | "ok" | "done" {
  if (Date.now() - pin.createdAt > STALE_MS) return "done"
  const root = host.shadowRoot
  if (root == null) return "wait"
  const sep = findSeparator(root, pin.index)
  if (sep === undefined) {
    adjustScroll(pin.scroller, pin.scroller.scrollHeight - pin.scrollHeight)
    return "done"
  }
  const delta = sep.getBoundingClientRect().top - pin.top
  if (Math.abs(delta) < ALIGN_PX) return "ok"
  adjustScroll(pin.scroller, delta)
  return "wait"
}

export function watchGapPin(
  pin: GapPin,
  host: HTMLElement,
  live: () => boolean,
  onDone: () => void,
  schedule: (tick: () => void) => void = requestAnimationFrame,
): void {
  let aligned = 0
  let moved = false
  const tick = () => {
    if (!live() || Date.now() - pin.createdAt > STALE_MS) {
      onDone()
      return
    }
    const result = settleGapPin(pin, host)
    if (result === "done") {
      onDone()
      return
    }
    if (result === "wait") {
      moved = true
      aligned = 0
    } else {
      aligned += 1
      if (moved && aligned >= ALIGNED_FRAMES) {
        onDone()
        return
      }
    }
    schedule(tick)
  }
  schedule(tick)
}

function findSeparator(root: ShadowRoot, index: string): HTMLElement | undefined {
  if (!/^\d+$/.test(index)) return
  const sep = root.querySelector(`[data-expand-index="${index}"]`)
  return isBox(sep) ? sep : undefined
}

function hasClosest(node: EventTarget): node is Element {
  return typeof (node as Element).closest === "function"
}

function isBox(node: Element | null): node is HTMLElement {
  return node != null && typeof (node as HTMLElement).getBoundingClientRect === "function"
}
