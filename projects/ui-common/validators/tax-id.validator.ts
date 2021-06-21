import { FormControl } from '@angular/forms'

/**
 * Validates that value matches on of the following:
 *  ''             // empty string
 *  'xxxxxxxxx'    // 'x' is a number
 *  'xx-xxxxxxx'   // 'x' is a number
 *  'xxx-xx-xxxx'  // 'x' is a number
 */
export function taxIdValidator(control: FormControl) {
  const isValid = /^$|^\d{9}$|^\d{2}-\d{7}$|^\d{3}-\d{2}-\d{4}$/.test(control.value)
  return isValid
    ? null : { taxId: {} }
}
