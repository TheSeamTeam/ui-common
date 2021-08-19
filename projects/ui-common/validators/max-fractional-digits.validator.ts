import { AbstractControl, ValidatorFn } from '@angular/forms'

import { fractionalDigitsCount, isEmptyInputValue, isNumeric } from '@theseam/ui-common/utils'

/**
 * Validates a number does not have more than X fractional digits.
 *
 * NOTE: If a value is not a number then the value will be valid. To ensure the
 * value is also a number then also use a number validator, such as
 * `decimalValidator`.
 */
export function maxFractionalDigitsValidator(maxFractionalDigits: number): ValidatorFn {
  return (control: AbstractControl) => {
    if (isEmptyInputValue(control.value)) {
      return null // don't validate empty values to allow optional controls
    }

    if (Array.isArray(control.value) || !isNumeric(control.value)) {
      return null // can't validate that a non-number has more than the max
    }

    const count = fractionalDigitsCount(`${control.value}`)

    if (count === null) {
      return null // should not happen, because we already checked for a numeric
    }

    if (count > maxFractionalDigits) {
      return {
        'maxFractionalDigits': {
          'reason': `Must not be greater than ${maxFractionalDigits} fractional digits.`,
          'max': maxFractionalDigits,
          'actual': count
        }
      }
    }

    return null
  }
}
