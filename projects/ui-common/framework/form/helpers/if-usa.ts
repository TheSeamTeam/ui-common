import { isDevMode } from '@angular/core'
import { AbstractControl, ValidatorFn } from '@angular/forms'

import { isEmptyInputValue } from '@theseam/ui-common/utils'

import { isCountryUSA } from './is-country-usa'

/**
 * Use Validator if 'country' control value is 'USA'.
 *
 * If `countryControlOrPath` is not provided, it will be assumed there is a
 * sibling named 'country'.
 */
export function ifUSA(
  fn: ValidatorFn,
  countryControlOrPath?: AbstractControl | string | (string | number)[],
): ValidatorFn {
  return (control: AbstractControl) => {
    let countryControl: AbstractControl | null = null
    if (countryControlOrPath) {
      if (
        typeof countryControlOrPath === 'string' ||
        Array.isArray(countryControlOrPath)
      ) {
        countryControl = control.parent?.get(countryControlOrPath) ?? null
      } else {
        countryControl = countryControlOrPath
      }
    } else {
      countryControl = control.parent?.get('country') ?? null
    }

    if (!countryControl) {
      return null
    }

    if (!(countryControl instanceof AbstractControl)) {
      if (isDevMode()) {
        // eslint-disable-next-line no-console
        console.warn(`ifUSA expects 'country' control to be a FormControl.`)
      }
      return null
    }

    if (
      !isEmptyInputValue(countryControl.value) &&
      isCountryUSA(countryControl)
    ) {
      return fn(control)
    }

    return null
  }
}
