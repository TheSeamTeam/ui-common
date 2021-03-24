/**
 *
 */
export function hasAttribute<E extends HTMLElement>(element: E, name: string): boolean {
  return element.hasAttribute(name)
}
