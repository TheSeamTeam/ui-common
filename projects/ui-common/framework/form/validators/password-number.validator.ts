import { AbstractControl } from '@angular/forms'

import { isEmptyInputValue } from '@theseam/ui-common/utils'

/**
 * Requires at least one digit.
 */
export function passwordNumberValidator(control: AbstractControl) {
  if (isEmptyInputValue(control.value)) {
    return null
  }
  return control.value.match(/\d/) ? null : { passwordNumber: {} }
}
