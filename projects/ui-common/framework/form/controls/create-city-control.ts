import { FormControl } from '@angular/forms'

import { TheSeamAddressFieldConfig } from '../models/address-field-config'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'
import { getCityValidators } from './get-city-validators'

export function createCityControl(
  formState: string | null = null,
  config?: Partial<TheSeamAddressFieldConfig>,
  overrides?: TheSeamValidatorOverrides,
): FormControl<string | null> {
  const v = getCityValidators(config, overrides)
  return new FormControl(formState, v.validators, v.asyncValidators)
}
