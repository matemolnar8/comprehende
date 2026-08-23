/** Pierre inserts `up` / `both` lines above the remaining bar. That moves the bar
 *  down in document flow. `down` inserts below, so the control stays put. After
 *  `up` or `both`, shift the scrollport so the same control stays under the cursor.
 *
 *  Pierre's click map (InteractionManager): `data-expand-up` → up, `data-expand-down`
 *  → down, count / missing direction / `data-expand-all-button` → both. */

export type ExpandKind = "up" | "down" | "both"

export type ExpandClick = {
  kind: ExpandKind
  index: string
  selector: string
  anchor: Element
}

export type PendingPin = {
  scroller: HTMLElement
  top: number
  index: string
  selector: string
  createdAt: number
}

export const COUNT_SELECTOR = "[data-unmodified-lines], [data-separator-content]"
export const PIN_STALE_MS = 2000
export const PIN_MOVED_PX = 2

export function shouldPinExpand(kind: ExpandKind): boolean {
  return kind === "up" || kind === "both"
}

export function parseExpandClick(path: readonly EventTarget[]): ExpandClick | undefined {
  const target = path.find(hasClosest)
  if (target === undefined) return
  const index = target.closest("[data-expand-index]")?.getAttribute("data-expand-index")
  if (index == null) return

  const all = target.closest("[data-expand-all-button]")
  if (all) return { kind: "both", index, selector: "[data-expand-all-button]", anchor: all }

  const up = target.closest("[data-expand-up]")
  if (up) return { kind: "up", index, selector: "[data-expand-up]", anchor: up }

  const down = target.closest("[data-expand-down]")
  if (down) return { kind: "down", index, selector: "[data-expand-down]", anchor: down }

  const count = target.closest(COUNT_SELECTOR)
  if (count) return { kind: "both", index, selector: COUNT_SELECTOR, anchor: count }
}

export function overflowAncestor(start: Element): HTMLElement | undefined {
  for (let node: Element | null = start.parentElement; node; node = node.parentElement) {
    if (!(node instanceof HTMLElement)) continue
    const { overflow, overflowY } = getComputedStyle(node)
    if (/(auto|scroll)/.test(`${overflow}${overflowY}`)) return node
  }
}

export function pinScrollAfterExpand(scroller: HTMLElement, beforeTop: number, afterTop: number): void {
  const delta = afterTop - beforeTop
  if (delta === 0) return
  scroller.scrollTop += delta
}

export function restorePinnedExpand(pin: PendingPin, fileContainer: HTMLElement): "restored" | "gone" | "pending" {
  if (Date.now() - pin.createdAt > PIN_STALE_MS) return "gone"
  const root = fileContainer.shadowRoot
  if (root == null) return "pending"
  const sep = root.querySelector(`[data-expand-index="${cssEscape(pin.index)}"]`)
  if (sep == null) return "gone"
  const match = sep.querySelector(pin.selector)
  const el = hasRect(match) ? match : hasRect(sep) ? sep : undefined
  if (el === undefined) return "gone"
  const afterTop = el.getBoundingClientRect().top
  if (Math.abs(afterTop - pin.top) < PIN_MOVED_PX) return "pending"
  pinScrollAfterExpand(pin.scroller, pin.top, afterTop)
  return "restored"
}

function hasClosest(node: EventTarget): node is Element {
  return typeof (node as Element).closest === "function"
}

function hasRect(node: Element | null): node is HTMLElement {
  return node != null && typeof (node as HTMLElement).getBoundingClientRect === "function"
}

function cssEscape(value: string): string {
  return typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(value) : value
}
