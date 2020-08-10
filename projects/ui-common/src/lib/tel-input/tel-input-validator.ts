import { FormControl } from '@angular/forms'

import { notNullOrUndefined, waitOnConditionAsync } from '../utils/index'
import { TEL_INPUT_UTILS_PATH } from './tel-input-constants'

interface TelInputCountryData {
  areaCodes: string[] | null
  dialCode: string
  iso2: string
  name: string
  priority: number
}

interface TelInputValidatorCountryData {
  dialCodes: { [dialCode: string]: boolean }
  countryCodes: { [dialCode: string]: string[] }
  countryCodeMaxLen: number
}

function getNumeric(s: string): string {
  return s.replace(/\D/g, '')
}

/**
 * add a country code to this.countryCodes
 *
 * Based on: https://github.com/jackocnr/intl-tel-input/blob/4fe25fcf142c341a85b7b15cc307d66afb8573a3/src/js/intlTelInput.js#L197
 */
function addCountryCode(data: TelInputValidatorCountryData, iso2: string, countryCode: string, priority?: number) {
  if (countryCode.length > data.countryCodeMaxLen) {
    data.countryCodeMaxLen = countryCode.length
  }
  if (!data.countryCodes.hasOwnProperty(countryCode)) {
    data.countryCodes[countryCode] = []
  }
  // bail if we already have this country for this countryCode
  for (let i = 0; i < data.countryCodes[countryCode].length; i++) {
    if (data.countryCodes[countryCode][i] === iso2) { return }
  }
  // check for undefined as 0 is falsy
  const index = (priority !== undefined) ? priority : data.countryCodes[countryCode].length
  data.countryCodes[countryCode][index] = iso2
}

/**
 * process the countryCodes map
 *
 * Based on: https://github.com/jackocnr/intl-tel-input/blob/4fe25fcf142c341a85b7b15cc307d66afb8573a3/src/js/intlTelInput.js#L252
 */
function processCountryCodes(countries: TelInputCountryData[]): TelInputValidatorCountryData {
  const data: TelInputValidatorCountryData = {
    countryCodeMaxLen: 0,
    // here we store just dial codes
    dialCodes: {},
    // here we store "country codes" (both dial codes and their area codes)
    countryCodes: {}
  }

  // first: add dial codes
  for (let i = 0; i < countries.length; i++) {
    const c = countries[i]
    if (!data.dialCodes[c.dialCode]) { data.dialCodes[c.dialCode] = true }
    addCountryCode(data, c.iso2, c.dialCode, c.priority)
  }

  // next: add area codes
  // this is a second loop over countries, to make sure we have all of the "root" countries
  // already in the map, so that we can access them, as each time we add an area code substring
  // to the map, we also need to include the "root" country's code, as that also matches
  for (let i = 0; i < countries.length; i++) {
    const c = countries[i]
    // area codes
    if (c.areaCodes) {
      const rootCountryCode = data.countryCodes[c.dialCode][0]
      // for each area code
      for (let j = 0; j < c.areaCodes.length; j++) {
        const areaCode = c.areaCodes[j]
        // for each digit in the area code to add all partial matches as well
        for (let k = 1; k < areaCode.length; k++) {
          const partialDialCode = c.dialCode + areaCode.substr(0, k)
          // start with the root country, as that also matches this dial code
          addCountryCode(data, rootCountryCode, partialDialCode)
          addCountryCode(data, c.iso2, partialDialCode)
        }
        // add the full area code
        addCountryCode(data, c.iso2, c.dialCode + areaCode)
      }
    }
  }

  return data
}

/**
 * try and extract a valid international dial code from a full telephone number
 * Note: returns the raw string inc plus character and any whitespace/dots etc
 *
 * Based on: https://github.com/jackocnr/intl-tel-input/blob/4fe25fcf142c341a85b7b15cc307d66afb8573a3/src/js/intlTelInput.js#L1161
 */
function getDialCode(data: TelInputValidatorCountryData, number: string, includeAreaCode: boolean = false): string {
  // console.log('getDialCode', number, includeAreaCode)
  // const data = processCountryCodes(window.intlTelInputGlobals.getCountryData() as TelInputCountryData[])

  let dialCode = ''
  // only interested in international numbers (starting with a plus)
  if (number.charAt(0) === '+') {
    let numericChars = ''
    // iterate over chars
    for (let i = 0; i < number.length; i++) {
      const c = number.charAt(i)
      // if char is number (https://stackoverflow.com/a/8935649/217866)
      if (!isNaN(parseInt(c, 10))) {
        numericChars += c
        // if current numericChars make a valid dial code
        if (includeAreaCode) {
          if (data.countryCodes[numericChars]) {
            // store the actual raw string (useful for matching later)
            dialCode = number.substr(0, i + 1)
          }
        } else {
          if (data.dialCodes[numericChars]) {
            dialCode = number.substr(0, i + 1)
            // if we're just looking for a dial code, we can break as soon as we find one
            break
          }
        }
        // stop searching as soon as we can - in this case when we hit max len
        if (numericChars.length === data.countryCodeMaxLen) {
          break
        }
      }
    }
  }

  // console.log('getDialCode return', dialCode)
  return dialCode
}

function getUtils(): Promise<any> {
  if (window.intlTelInputUtils) {
    return Promise.resolve(window.intlTelInputUtils)
  }

  if ((window.intlTelInputGlobals as any).startedLoadingUtilsScript) {
    return waitOnConditionAsync(() => notNullOrUndefined(window.intlTelInputUtils), 5000)
      .then(() => window.intlTelInputUtils)
  }

  return window.intlTelInputGlobals.loadUtils(TEL_INPUT_UTILS_PATH) as unknown as Promise<any>
}

export const TEL_VALIDATOR_KEY = 'telInput'

export function telInputValidator(control: FormControl) {
  const value = control.value
  // console.log('[telInputValidator] value', value)

  // This validator doesn't need to do anything if there isn't a value.
  if (typeof value !== 'string' || value.length === 0) {
    return Promise.resolve(null)
  }

  return getUtils().then(utils => {
    // console.log('[telInputValidator] utils', utils)
    // console.log('[telInputValidator] window.intlTelInputGlobals', window.intlTelInputGlobals)

    // const countryData = window.intlTelInputGlobals.getCountryData()
    // console.log('[telInputValidator] countryData', countryData)

    const data = processCountryCodes(window.intlTelInputGlobals.getCountryData() as TelInputCountryData[])

    const dialCode = getDialCode(data, value)
    // console.log('[telInputValidator] dialCode', dialCode)

    const _countryCodes = data.countryCodes[getNumeric(dialCode)]
    // Refer to `_setInitialState` to get libraries default logic
    const countryCode = (_countryCodes === undefined || _countryCodes === null || _countryCodes.length === 0) ? 'us' : _countryCodes[0]
    // console.log('[telInputValidator] countryCode', countryCode)

    let number = value
    if (number.charAt(0) !== '+') {
      if (number.charAt(0) !== '1') { number = `1${number}` }
      number = `+${number}`
    }

    // console.log('[telInputValidator] number', number)

    // const num = utils.formatNumber(number, countryCode, intlTelInputUtils.numberFormat.E164)
    // console.log('[telInputValidator] num', num)

    const isValid = utils.isValidNumber(number, countryCode)
    // console.log('[telInputValidator] isValid', isValid)

    if (!isValid) {
      const error = utils.getValidationError(number, countryCode)
      // console.log('[telInputValidator] error', error)

      // NOTE: These could be different validators, but the library only
      // calculates one at a time.
      switch (error) {
        case intlTelInputUtils.validationError.INVALID_COUNTRY_CODE:
          return {
            [TEL_VALIDATOR_KEY]: {
              code: error,
              message: 'Country code is invalid.'
            }
          }
        case intlTelInputUtils.validationError.TOO_SHORT:
          return {
            [TEL_VALIDATOR_KEY]: {
              code: error,
              message: 'Number is too short.'
            }
          }
        case intlTelInputUtils.validationError.TOO_LONG:
          return {
            [TEL_VALIDATOR_KEY]: {
              code: error,
              message: 'Number is too long.'
            }
          }
        case intlTelInputUtils.validationError.NOT_A_NUMBER:
          return {
            [TEL_VALIDATOR_KEY]: {
              code: error,
              message: 'Must be numbers only.'
            }
          }
        default:
          return {
            [TEL_VALIDATOR_KEY]: {
              code: error,
              message: 'Invalid number.'
            }
          }
      }
    }

    return null
  })
}
