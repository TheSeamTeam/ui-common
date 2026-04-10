import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'

import { getStateValidators } from './get-state-validators'

export function createStateControl(
  formState: string | null = null,
  stateCodes: Observable<string[]>,
  requiredOutsideUSA: boolean = true,
): FormControl<string | null> {
  const v = getStateValidators(stateCodes, undefined, requiredOutsideUSA)
  return new FormControl(formState, v.validators, v.asyncValidators)
}
