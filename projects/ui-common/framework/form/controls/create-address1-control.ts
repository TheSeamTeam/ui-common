import { FormControl } from '@angular/forms'

import { TheSeamAddressFieldConfig } from '../models/address-field-config'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'
import { getAddress1Validators } from './get-address1-validators'

export function createAddress1Control(
  formState: string | null = null,
  config?: Partial<TheSeamAddressFieldConfig>,
  overrides?: TheSeamValidatorOverrides,
): FormControl<string | null> {
  const v = getAddress1Validators(config, overrides)
  return new FormControl(formState, v.validators, v.asyncValidators)
}
