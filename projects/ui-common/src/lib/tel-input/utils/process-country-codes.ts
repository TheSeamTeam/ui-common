import { intlTelInputUtils } from '../intl-tel-input'
import { TelInputCountryData } from '../models'
import { addCountryCode } from './add-country-code'

/**
 * Process the countryCodes map.
 *
 * Based on: https://github.com/jackocnr/intl-tel-input/blob/4fe25fcf142c341a85b7b15cc307d66afb8573a3/src/js/intlTelInput.js#L252
 */
export function processCountryCodes(countries: intlTelInputUtils.CountryData[]): TelInputCountryData {
  const data: TelInputCountryData = {
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
