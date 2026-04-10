import { AbstractControl } from '@angular/forms'

import { isEmptyInputValue } from '@theseam/ui-common/utils'

/**
 * Requires at least one special character.
 */
export function passwordSpecialCharValidator(control: AbstractControl) {
  if (isEmptyInputValue(control.value)) {
    return null
  }
  return control.value.match(/[-!@#$%^&*()_+|~=`{}[\]:";'<>?,./]/)
    ? null
    : { passwordSpecialChar: {} }
}
