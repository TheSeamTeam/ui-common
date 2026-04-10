import { AbstractControl, ValidatorFn } from '@angular/forms'

import { isEmptyInputValue } from '@theseam/ui-common/utils'

/**
 * Requires at least one uppercase letter.
 */
export const passwordUppercaseValidator: ValidatorFn = (
  control: AbstractControl,
) => {
  if (isEmptyInputValue(control.value)) {
    return null
  }
  return control.value.match(/[A-Z]/) ? null : { passwordUppercase: {} }
}
