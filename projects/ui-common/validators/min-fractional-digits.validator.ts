import { AbstractControl, ValidatorFn } from '@angular/forms'

import { fractionalDigitsCount, isEmptyInputValue, isNumeric } from '@theseam/ui-common/utils'

/**
 * Validates a number has at least X fractional digits.
 *
 * NOTE: If a value is not a number then the value will be valid. To ensure the
 * value is also a number then also use a number validator, such as
 * `decimalValidator`.
 */
export function minFractionalDigitsValidator(minFractionalDigits: number): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmptyInputValue(control.value)) {
      return null // don't validate empty values to allow optional controls
    }

    if (Array.isArray(control.value) || !isNumeric(control.value)) {
      return null // can't validate that a non-number has less than the min
    }

    const count = fractionalDigitsCount(`${control.value}`)

    if (count === null) {
      return null // should not happen, because we already checked for a numeric
    }

    if (count < minFractionalDigits) {
      return {
        'minFractionalDigits': {
          'reason': `Must not be less than ${minFractionalDigits} fractional digits.`,
          'min': minFractionalDigits,
          'actual': count
        }
      }
    }

    return null
  }
}
