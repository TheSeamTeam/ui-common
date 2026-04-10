import { AbstractControl, ValidatorFn, Validators } from '@angular/forms'

import { isEmptyInputValue } from '@theseam/ui-common/utils'

import {
  DEFAULT_ADDRESS_FIELD_CONFIG,
  TheSeamAddressFieldConfig,
} from '../models/address-field-config'
import { TheSeamControlValidators } from '../models/control-validators'
import { TheSeamCreateCountryControlOptions } from '../models/create-country-control-options'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'

const onlyAllowUsaValidator: ValidatorFn = (control: AbstractControl) => {
  if (isEmptyInputValue(control.value)) {
    return null
  }
  return control.value !== 'USA' ? { onlyAllowUsa: {} } : null
}

export function getCountryValidators(
  config?: Partial<TheSeamAddressFieldConfig>,
  options?: TheSeamCreateCountryControlOptions,
  overrides?: TheSeamValidatorOverrides,
): TheSeamControlValidators {
  const c = { ...DEFAULT_ADDRESS_FIELD_CONFIG, ...config }
  const o = { required: true, ...overrides }

  const validators: ValidatorFn[] = [
    ...(o.required ? [Validators.required] : []),
    Validators.maxLength(c.countryMaxLength),
  ]

  if (options?.onlyAllowUsa) {
    validators.push(onlyAllowUsaValidator)
  }

  return { validators, asyncValidators: [] }
}
