import { AbstractControl } from '@angular/forms'

import { isEmptyInputValue } from '@theseam/ui-common/utils'

/**
 * Requires at least one uppercase letter.
 */
export function passwordUppercaseValidator(control: AbstractControl) {
  if (isEmptyInputValue(control.value)) {
    return null
  }
  return control.value.match(/[A-Z]/) ? null : { passwordUppercase: {} }
}
