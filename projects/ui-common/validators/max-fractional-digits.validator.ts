import { AbstractControl, ValidatorFn, Validators } from '@angular/forms'

import { isEmptyInputValue, isNumeric } from '@theseam/ui-common/utils'

export const DECIMAL_REGEX = /^([-+]{1})?\d*(\.\d*)?$/

export function maxFractionalDigitsValidator(maxFactionalDigits: number): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmptyInputValue(control.value)) {
      return null // don't validate empty values to allow optional controls
    }

    const isDecimal =
      !Array.isArray(control.value) &&
      isNumeric(control.value) &&
      (Validators.pattern(DECIMAL_REGEX)(control) === null)

    if (!isDecimal) {
      return { 'decimal': { 'reason': 'Must be valid decimal number.' } }
    }

    return null
  }
}
