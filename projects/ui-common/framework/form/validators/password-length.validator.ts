import { AbstractControl, ValidatorFn } from '@angular/forms'

import { isEmptyInputValue } from '@theseam/ui-common/utils'

import { TheSeamPasswordFieldConfig } from '../models/password-field-config'

const DEFAULT_CONFIG: TheSeamPasswordFieldConfig = {
  minLength: 8,
}

/**
 * Requires password to meet a minimum length.
 */
export function passwordLengthValidator(
  config?: Partial<TheSeamPasswordFieldConfig>,
): ValidatorFn {
  const c = { ...DEFAULT_CONFIG, ...config }
  return (control: AbstractControl) => {
    if (isEmptyInputValue(control.value)) {
      return null
    }
    return control.value.length >= c.minLength ? null : { passwordLength: {} }
  }
}
