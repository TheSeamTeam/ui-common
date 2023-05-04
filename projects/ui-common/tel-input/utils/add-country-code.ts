import type { TelInputCountryData } from '../models/index'

/**
 * Add a country code to this.countryCodes.
 *
 * Based on: https://github.com/jackocnr/intl-tel-input/blob/4fe25fcf142c341a85b7b15cc307d66afb8573a3/src/js/intlTelInput.js#L197
 */
export function addCountryCode(data: TelInputCountryData, iso2: string, countryCode: string, priority?: number) {
  if (countryCode.length > data.countryCodeMaxLen) {
    data.countryCodeMaxLen = countryCode.length
  }
  if (!Object.prototype.hasOwnProperty.call(data.countryCodes, countryCode)) {
    data.countryCodes[countryCode] = []
  }
  // bail if we already have this country for this countryCode
  for (const code of data.countryCodes[countryCode]) {
    if (code === iso2) { return }
  }
  // check for undefined as 0 is falsy
  const index = (priority !== undefined) ? priority : data.countryCodes[countryCode].length
  data.countryCodes[countryCode][index] = iso2
}
