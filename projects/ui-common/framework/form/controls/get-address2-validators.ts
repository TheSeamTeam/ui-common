import { Validators } from '@angular/forms'

import {
  DEFAULT_ADDRESS_FIELD_CONFIG,
  TheSeamAddressFieldConfig,
} from '../models/address-field-config'
import { TheSeamControlValidators } from '../models/control-validators'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'

export function getAddress2Validators(
  config?: Partial<TheSeamAddressFieldConfig>,
  overrides?: TheSeamValidatorOverrides,
): TheSeamControlValidators {
  const c = { ...DEFAULT_ADDRESS_FIELD_CONFIG, ...config }
  const o = { required: false, ...overrides }

  return {
    validators: [
      ...(o.required ? [Validators.required] : []),
      Validators.maxLength(c.address2MaxLength),
    ],
    asyncValidators: [],
  }
}
