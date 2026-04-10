import { Validators } from '@angular/forms'

import { TheSeamControlValidators } from '../models/control-validators'
import { TheSeamPasswordFieldConfig } from '../models/password-field-config'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'
import { passwordContentValidator } from '../validators/password-content.validator'
import { passwordLengthValidator } from '../validators/password-length.validator'
import { passwordLowercaseValidator } from '../validators/password-lowercase.validator'
import { passwordNumberValidator } from '../validators/password-number.validator'
import { passwordSpecialCharValidator } from '../validators/password-special-char.validator'
import { passwordUppercaseValidator } from '../validators/password-uppercase.validator'

export function getPasswordValidators(
  config?: Partial<TheSeamPasswordFieldConfig>,
  overrides?: TheSeamValidatorOverrides,
): TheSeamControlValidators {
  const o = { required: true, ...overrides }

  return {
    validators: [
      ...(o.required ? [Validators.required] : []),
      passwordContentValidator,
      passwordLengthValidator(config),
      passwordUppercaseValidator,
      passwordLowercaseValidator,
      passwordNumberValidator,
      passwordSpecialCharValidator,
    ],
    asyncValidators: [],
  }
}
