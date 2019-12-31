/**
 *
 */
export function getAttribute<E extends HTMLElement>(element: E, name: string): string | null {
  return element.getAttribute(name)
}
