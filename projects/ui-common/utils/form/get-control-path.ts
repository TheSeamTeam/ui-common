import { AbstractControl } from '@angular/forms'

import { getControlName } from './get-control-name'

/**
 * Get the path to a control.
 *
 * The path is built by walking back the `parent` properties until `parent` is
 * `null`.
 *
 * Example:
 *
 * ```js
 * const group = new FormGroup({
 *   name: new FormControl(),
 *   address: new FormGroup({
 *     city: new FormControl(),
 *     state: new FormControl()
 *   })
 * })
 *
 * const control = group.get('address.city')
 * console.log(getControlPath(control))
 *
 * // Output:
 * >> 'address.city'
 * ```
 *
 */
export function getControlPath(c: AbstractControl, path: string = ''): string | null {
  let _path = path
  _path = getControlName(c) + _path

  if (c.parent && getControlName(c.parent)) {
    _path = `.${_path}`
    return getControlPath(c.parent, _path)
  } else {
    return _path
  }
}
