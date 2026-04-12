import { Validators } from '@angular/forms'

import { TheSeamControlValidators } from '../models/control-validators'
import {
  DEFAULT_USERNAME_FIELD_CONFIG,
  TheSeamUsernameFieldConfig,
} from '../models/username-field-config'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'
import {
  TheSeamUserExistsFn,
  usernameExistsValidator,
} from '../validators/username-exists.validator'

export function getUsernameValidators(
  userExists: TheSeamUserExistsFn,
  config?: Partial<TheSeamUsernameFieldConfig>,
  overrides?: TheSeamValidatorOverrides,
): TheSeamControlValidators {
  const c = { ...DEFAULT_USERNAME_FIELD_CONFIG, ...config }
  const o = { required: true, ...overrides }

  return {
    validators: [
      ...(o.required ? [Validators.required] : []),
      Validators.minLength(c.minLength),
      Validators.pattern(c.pattern),
    ],
    asyncValidators: [usernameExistsValidator(userExists)],
  }
}
