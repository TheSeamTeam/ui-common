import { FormControl } from '@angular/forms'

import { TheSeamCreateCountryControlOptions } from '../models/create-country-control-options'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'
import { getCountryValidators } from './get-country-validators'

export function createCountryControl(
  formState: string | null = null,
  options?: TheSeamCreateCountryControlOptions,
  overrides?: TheSeamValidatorOverrides,
): FormControl<string | null> {
  const v = getCountryValidators(undefined, options, overrides)
  return new FormControl(formState, v.validators, v.asyncValidators)
}
