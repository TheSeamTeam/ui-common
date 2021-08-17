import { AbstractControl, ValidatorFn, Validators } from '@angular/forms'

import { isEmptyInputValue, isNumeric } from '@theseam/ui-common/utils'

export const DECIMAL_REGEX = /^([-+]{1})?\d*(\.\d*)?$/

function _decimalValidator(): ValidatorFn {
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

/**
 * Validates control value is a valid decimal number.
 *
 * NOTE: This does not allow any js valid decimal number. It only accepts them
 * in a format expected by our backend.
 */
export const decimalValidator: ValidatorFn = _decimalValidator()
