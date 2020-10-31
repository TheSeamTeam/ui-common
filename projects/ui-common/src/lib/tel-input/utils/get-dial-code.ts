import { TelInputCountryData } from '../models'

/**
 * Try and extract a valid international dial code from a full telephone number.
 *
 * NOTE: returns the raw string inc plus character and any whitespace/dots etc.
 *
 * Based on: https://github.com/jackocnr/intl-tel-input/blob/4fe25fcf142c341a85b7b15cc307d66afb8573a3/src/js/intlTelInput.js#L1161
 */
export function getDialCode(data: TelInputCountryData, number: string, includeAreaCode: boolean = false): string {
  // console.log('getDialCode', number, includeAreaCode)
  // const data = processCountryCodes(globalIntlTelInputGlobals().getCountryData() as TelInputCountryData[])

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
