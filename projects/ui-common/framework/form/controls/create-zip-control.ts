import { FormControl } from '@angular/forms'

import { getZipValidators } from './get-zip-validators'

export function createZipControl(
  formState: string | null = null,
): FormControl<string | null> {
  const v = getZipValidators()
  return new FormControl(formState, v.validators, v.asyncValidators)
}
