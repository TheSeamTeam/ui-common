import { AbstractControl, Validators } from '@angular/forms'

import {
  DEFAULT_ADDRESS_FIELD_CONFIG,
  TheSeamAddressFieldConfig,
} from '../models/address-field-config'
import { TheSeamControlValidators } from '../models/control-validators'
import { ifUSA } from '../helpers/if-usa'

export function getZipValidators(
  countryControlOrPath?: AbstractControl | string | (string | number)[],
  config?: Partial<TheSeamAddressFieldConfig>,
): TheSeamControlValidators {
  const c = { ...DEFAULT_ADDRESS_FIELD_CONFIG, ...config }

  return {
    validators: [
      ifUSA(Validators.required, countryControlOrPath),
      ifUSA(Validators.pattern(c.zipcodePattern), countryControlOrPath),
      Validators.maxLength(10),
    ],
    asyncValidators: [],
  }
}
