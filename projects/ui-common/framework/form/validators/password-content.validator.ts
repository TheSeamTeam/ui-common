import { AbstractControl } from '@angular/forms'

import { isEmptyInputValue } from '@theseam/ui-common/utils'

/**
 * Rejects passwords that contain the word "password" (case-insensitive).
 */
export function passwordContentValidator(control: AbstractControl) {
  if (isEmptyInputValue(control.value)) {
    return null
  }
  return control.value.toLowerCase().indexOf('password') === -1
    ? null
    : { passwordContent: { value: 'password' } }
}
