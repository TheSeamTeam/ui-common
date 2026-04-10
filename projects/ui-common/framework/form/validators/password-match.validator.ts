import { AbstractControl } from '@angular/forms'

/**
 * Group-level validator that checks password1 and password2 controls match.
 */
export function passwordMatchValidator(g: AbstractControl) {
  const control1 = g.get('password1')
  const control2 = g.get('password2')
  const value1 = control1 && control1.value
  const value2 = control2 && control2.value
  return value1 === value2 ? null : { passwordMatch: true }
}
