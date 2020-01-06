/**
 * Source: https://developer.mozilla.org/en-US/docs/Web/API/Element/toggleAttribute#Polyfill
 */
export function toggleAttribute(element, name, force) {
  if (force !== void 0) { force = !!force }

  if (element.getAttribute(name) !== null) {
    if (force) { return true }

    element.removeAttribute(name)
    return false
  } else {
    if (force === false) { return false }

    element.setAttribute(name, '')
    return true
  }
}
