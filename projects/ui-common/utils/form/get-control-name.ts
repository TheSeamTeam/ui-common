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
  // NOTE: Typed as 'any' because using string for array index is not valid for
  // array index type, but it works and we actually want the index as a string
  // anyway.
  const controls: any = c.parent.controls
  return Object.keys(controls).find(name => c === controls[name]) || null
}
