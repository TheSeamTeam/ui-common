import { AbstractControl, ValidatorFn, Validators } from '@angular/forms'

import { isEmptyInputValue, isNumeric } from '@theseam/ui-common/utils'

export const INTEGER_REGEX = /^([-+]{1})?[0-9]*$/

function _integerValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmptyInputValue(control.value)) {
      return null // don't validate empty values to allow optional controls
    }

    const isInteger =
      !Array.isArray(control.value) &&
      isNumeric(control.value) &&
      (Validators.pattern(INTEGER_REGEX)(control) === null)

    if (!isInteger) {
      return { 'integer': { 'reason': 'Must be valid integer.' } }
    }
    return null
  }
}

/**
 * Validates control value is a valid integer number.
 *
 * NOTE: This does not allow any js valid integer number. It only accepts them
 * in a format expected by our backend.
 */
export const integerValidator: ValidatorFn = _integerValidator()
