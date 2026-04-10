import { Validators } from '@angular/forms'

import {
  DEFAULT_ADDRESS_FIELD_CONFIG,
  TheSeamAddressFieldConfig,
} from '../models/address-field-config'
import { TheSeamControlValidators } from '../models/control-validators'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'

export function getCityValidators(
  config?: Partial<TheSeamAddressFieldConfig>,
  overrides?: TheSeamValidatorOverrides,
): TheSeamControlValidators {
  const c = { ...DEFAULT_ADDRESS_FIELD_CONFIG, ...config }
  const o = { required: true, ...overrides }

  const validators = [
    ...(o.required ? [Validators.required] : []),
    Validators.maxLength(c.cityMaxLength),
    Validators.pattern(/[A-Za-z0-9]+/),
  ]

  return { validators, asyncValidators: [] }
}
