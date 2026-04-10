import { AbstractControl } from '@angular/forms'

export function isCountryUSA(control: AbstractControl): boolean {
  return control.value === 'USA'
}
