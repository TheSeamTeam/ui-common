import {
  AbstractControl,
  AsyncValidatorFn,
  ValidatorFn,
  Validators,
} from '@angular/forms'
import { Observable } from 'rxjs'

import {
  DEFAULT_ADDRESS_FIELD_CONFIG,
  TheSeamAddressFieldConfig,
} from '../models/address-field-config'
import { TheSeamControlValidators } from '../models/control-validators'
import { ifUSA } from '../helpers/if-usa'
import { stateProvinceRegionValidator } from '../validators/state-province-region.validator'

export function getStateValidators(
  stateCodes: Observable<string[]>,
  countryControlOrPath?: AbstractControl | string | (string | number)[],
  requiredOutsideUSA: boolean = true,
  config?: Partial<TheSeamAddressFieldConfig>,
): TheSeamControlValidators {
  const c = { ...DEFAULT_ADDRESS_FIELD_CONFIG, ...config }

  const validators: ValidatorFn[] = []
  if (requiredOutsideUSA) {
    validators.push(Validators.required)
  } else {
    validators.push(ifUSA(Validators.required, countryControlOrPath))
  }
  validators.push(Validators.maxLength(c.stateMaxLength))

  const asyncValidators: AsyncValidatorFn[] = [
    stateProvinceRegionValidator(stateCodes),
  ]

  return { validators, asyncValidators }
}
