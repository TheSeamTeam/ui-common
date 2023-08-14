/**
 * Polyfil for `Element.toggleAttribute`
 *
 * Toggles a value without a value. Useful for attributes, such as `disabled`,
 * `readonly`, and `hidden`, that only needs to exist on the `Element` without
 * requiring a value.
 *
 * Most browsers natively support this feature, but IE, which we still try to
 * support for at least the main parts of the app, has "Unknown" support of this
 * feature. Until IE support is dropped this polyfil should be used to toggle an
 * attribute.
 *
 * Source:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/toggleAttribute#Polyfill
 */
export function toggleAttribute(element: HTMLElement, name: string, force: boolean): boolean {
  let _force = force
  if (_force !== void 0) { _force = !!_force }

  if (element.getAttribute(name) !== null) {
    if (_force) { return true }

    element.removeAttribute(name)
    return false
  } else {
    if (_force === false) { return false }

    element.setAttribute(name, '')
    return true
  }
}
