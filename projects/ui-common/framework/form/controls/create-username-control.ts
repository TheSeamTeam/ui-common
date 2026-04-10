import { FormControl } from '@angular/forms'

import { TheSeamUsernameFieldConfig } from '../models/username-field-config'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'
import { TheSeamUserExistsFn } from '../validators/username-exists.validator'
import { getUsernameValidators } from './get-username-validators'

export function createUsernameControl(
  formState: string | null = null,
  userExists: TheSeamUserExistsFn,
  config?: Partial<TheSeamUsernameFieldConfig>,
  overrides?: TheSeamValidatorOverrides,
): FormControl<string | null> {
  const v = getUsernameValidators(userExists, config, overrides)
  return new FormControl(formState, v.validators, v.asyncValidators)
}
