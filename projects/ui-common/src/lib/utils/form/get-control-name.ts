import { AbstractControl } from '@angular/forms'

/**
 * Get the name of the control.
 *
 * Example:
 *
 * ```js
 * const group = new FormGroup({
 *  name: new Control(),
 *  age: new Control()
 * })
 *
 * for (const c of group.controls) {
 *   console.log(getControlName(c))
 * }
 *
 * // Output:
 * // >> 'name'
 * // >> 'age'
 * ```
 */
export function getControlName(c: AbstractControl): string | null {
  if (!c.parent) { return null }
  const controls = c.parent.controls
  return Object.keys(controls).find(name => c === controls[name]) || null
}
