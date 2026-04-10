import { AbstractControl, ValidatorFn } from '@angular/forms'

import { isEmptyInputValue } from '@theseam/ui-common/utils'

/**
 * Rejects passwords that contain the word "password" (case-insensitive).
 */
export const passwordContentValidator: ValidatorFn = (
  control: AbstractControl,
) => {
  if (isEmptyInputValue(control.value)) {
    return null
  }
  return control.value.toLowerCase().indexOf('password') === -1
    ? null
    : { passwordContent: { value: 'password' } }
}
