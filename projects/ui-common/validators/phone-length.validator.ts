import { FormControl } from '@angular/forms'

/**
 * Validates that a value is a valid phone number length.
 */
export function phoneLengthValidator(control: FormControl) {
  return control.value.length === 0 || (control.value.length <= 18 && control.value.length >= 7)
    ? null : { 'phoneLength': {} }
}
