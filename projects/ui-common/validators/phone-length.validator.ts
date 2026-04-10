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
    const value = control.value
    if (value == null || value.length === 0) {
      return null
    }
    return value.length <= c.maxLength && value.length >= c.minLength
      ? null
      : { phoneLength: {} }
  }
}
