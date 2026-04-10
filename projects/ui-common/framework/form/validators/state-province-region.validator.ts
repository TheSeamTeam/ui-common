import { AbstractControl, AsyncValidatorFn } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, take } from 'rxjs/operators'

import { isEmptyInputValue } from '@theseam/ui-common/utils'

import { isCountryUSA } from '../helpers/is-country-usa'

export function stateProvinceRegionValidator(
  stateCodes: Observable<string[]>,
): AsyncValidatorFn {
  return async (control: AbstractControl) => {
    const errorName = 'stateProvinceRegion'
    const value = control.value

    if (isEmptyInputValue(value)) {
      return null
    }

    if (control.parent == null) {
      return null
    }

    const countryControl = control.parent.get('country')
    if (countryControl === null) {
      // eslint-disable-next-line no-console
      console.warn(
        `stateProvinceRegionValidator requires sibling control named 'country'.`,
      )
      return null
    }

    if (isCountryUSA(countryControl)) {
      const isValidStateCode = await stateCodes
        .pipe(
          take(1),
          map((codes) => codes.indexOf(value) !== -1),
        )
        .toPromise()

      return isValidStateCode
        ? null
        : {
            [errorName]: {
              reason: `If value of 'country' is 'USA' then a valid state must be selected.`,
            },
          }
    }

    return null
  }
}
