import { UntypedFormControl } from '@angular/forms'

import {
  getCountryCode,
  getDialCode,
  getIntlTelInputUtils,
  getValidationErrorMessage,
  globalIntlTelInputGlobals,
  processCountryCodes
} from './utils'

export function telInputValidator(control: UntypedFormControl) {
  const value = control.value

  // This validator doesn't need to do anything if there isn't a value.
  if (typeof value !== 'string' || value.length === 0) {
    return Promise.resolve(null)
  }

  return getIntlTelInputUtils().then(utils => {
    const data = processCountryCodes(globalIntlTelInputGlobals().getCountryData())
    const dialCode = getDialCode(data, value)
    const countryCode = getCountryCode(data, dialCode)

    let number = value
    if (number.charAt(0) !== '+') {
      if (number.charAt(0) !== '1') { number = `1${number}` }
      number = `+${number}`
    }

    if (!utils.isValidNumber(number, countryCode)) {
      const code = utils.getValidationError(number, countryCode)
      const message = getValidationErrorMessage(code)
      return { 'telInput': { code, message } }
    }

    return null
  })
}
