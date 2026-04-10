import { AbstractControl, ValidatorFn } from '@angular/forms'

import { isEmptyInputValue } from '@theseam/ui-common/utils'

const TAX_ID_PATTERN = /^\d{9}$|^\d{2}-\d{7}$|^\d{3}-\d{2}-\d{4}$/

/**
 * Validates that value matches one of the following:
 *  'xxxxxxxxx'    // 'x' is a number
 *  'xx-xxxxxxx'   // 'x' is a number
 *  'xxx-xx-xxxx'  // 'x' is a number
 */
export const taxIdValidator: ValidatorFn = (control: AbstractControl) => {
  if (isEmptyInputValue(control.value)) {
    return null
  }
  return TAX_ID_PATTERN.test(control.value) ? null : { taxId: {} }
}
