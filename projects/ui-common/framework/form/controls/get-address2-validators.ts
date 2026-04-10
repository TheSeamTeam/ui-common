import { Validators } from '@angular/forms'

import {
  DEFAULT_ADDRESS_FIELD_CONFIG,
  TheSeamAddressFieldConfig,
} from '../models/address-field-config'
import { TheSeamControlValidators } from '../models/control-validators'

export function getAddress2Validators(
  config?: Partial<TheSeamAddressFieldConfig>,
): TheSeamControlValidators {
  const c = { ...DEFAULT_ADDRESS_FIELD_CONFIG, ...config }

  return {
    validators: [Validators.maxLength(c.address2MaxLength)],
    asyncValidators: [],
  }
}
