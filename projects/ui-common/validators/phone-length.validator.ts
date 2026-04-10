import { AbstractControl, ValidatorFn } from '@angular/forms'

export interface TheSeamPhoneLengthConfig {
  minLength: number
  maxLength: number
}

const DEFAULT_CONFIG: TheSeamPhoneLengthConfig = {
  minLength: 7,
  maxLength: 18,
}

/**
 * Validates that a value is a valid phone number length.
 */
export function phoneLengthValidator(
  config?: Partial<TheSeamPhoneLengthConfig>,
): ValidatorFn {
  const c = { ...DEFAULT_CONFIG, ...config }
  return (control: AbstractControl) => {
    return control.value.length === 0 ||
      (control.value.length <= c.maxLength &&
        control.value.length >= c.minLength)
      ? null
      : { phoneLength: {} }
  }
}
