import { FormControl } from '@angular/forms'

import { TheSeamAddressFieldConfig } from '../models/address-field-config'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'
import { getAddress2Validators } from './get-address2-validators'

export function createAddress2Control(
  formState: string | null = null,
  config?: Partial<TheSeamAddressFieldConfig>,
  overrides?: TheSeamValidatorOverrides,
): FormControl<string | null> {
  const v = getAddress2Validators(config, overrides)
  return new FormControl(formState, v.validators, v.asyncValidators)
}
