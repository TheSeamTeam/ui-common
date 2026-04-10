import { DestroyRef } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormGroup } from '@angular/forms'
import { auditTime, distinctUntilChanged, map, tap } from 'rxjs/operators'

import {
  TheSeamAddressFormControls,
  TheSeamAddressFormGroupOptions,
  TheSeamAddressFormGroupResult,
} from '../models/address-form-group-options'
import { isCountryUSA } from '../helpers/is-country-usa'
import { createAddress1Control } from './create-address1-control'
import { createAddress2Control } from './create-address2-control'
import { createCityControl } from './create-city-control'
import { createCountryControl } from './create-country-control'
import { createStateControl } from './create-state-control'
import { createZipControl } from './create-zip-control'
import { getStateValidators } from './get-state-validators'
import { getZipValidators } from './get-zip-validators'

export function createAddressFormGroup<
  T extends TheSeamAddressFormGroupOptions,
>(options: T): TheSeamAddressFormGroupResult<T> {
  const config = options.config
  const countryRequiredOutsideUSA = options.countryRequiredOutsideUSA ?? true
  const defaultCountry = options.defaultCountry ?? 'USA'

  const group = new FormGroup<TheSeamAddressFormControls>({
    address1: createAddress1Control(null, config),
    address2: createAddress2Control(null, config),
    city: createCityControl(null, config),
    state: createStateControl(
      null,
      options.stateCodes,
      countryRequiredOutsideUSA,
    ),
    zip: createZipControl(),
    country: createCountryControl(defaultCountry),
  })

  const countryCtrl = group.controls.country
  let countryChange$ = countryCtrl.valueChanges.pipe(
    map(() => isCountryUSA(countryCtrl)),
    distinctUntilChanged(),
    auditTime(0),
    tap(() => {
      const sv = getStateValidators(
        options.stateCodes,
        group.controls.state,
        countryRequiredOutsideUSA,
        config,
      )
      group.controls.state.setValidators(sv.validators)
      group.controls.state.setAsyncValidators(sv.asyncValidators)
      group.controls.state.updateValueAndValidity()

      const zv = getZipValidators(countryCtrl, config)
      group.controls.zip.setValidators(zv.validators)
      group.controls.zip.setAsyncValidators(zv.asyncValidators)
      group.controls.zip.updateValueAndValidity()
    }),
  )

  if (options.destroyRef) {
    countryChange$ = countryChange$.pipe(takeUntilDestroyed(options.destroyRef))
    countryChange$.subscribe()
    return group as TheSeamAddressFormGroupResult<T>
  }

  const subscription = countryChange$.subscribe()
  return { group, subscription } as TheSeamAddressFormGroupResult<T>
}
