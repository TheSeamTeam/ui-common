import { AbstractControl, ValidatorFn } from '@angular/forms'

import { isEmptyInputValue } from '@theseam/ui-common/utils'

/**
 * Requires at least one lowercase letter.
 */
export const passwordLowercaseValidator: ValidatorFn = (
  control: AbstractControl,
) => {
  if (isEmptyInputValue(control.value)) {
    return null
  }
  return control.value.match(/[a-z]/) ? null : { passwordLowercase: {} }
}
