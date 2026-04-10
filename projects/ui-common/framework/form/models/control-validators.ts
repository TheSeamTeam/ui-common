import { AsyncValidatorFn, ValidatorFn } from '@angular/forms'

export interface TheSeamControlValidators {
  validators: ValidatorFn[]
  asyncValidators: AsyncValidatorFn[]
}
