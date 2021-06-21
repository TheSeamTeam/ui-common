import { intlTelInputUtils } from '../intl-tel-input'

export const VALIDATOR_CODE_MESSAGES: { [key: number]: string } = {
  [intlTelInputUtils.validationError.INVALID_COUNTRY_CODE]: 'Country code is invalid.',
  [intlTelInputUtils.validationError.TOO_SHORT]: 'Number is too short.',
  [intlTelInputUtils.validationError.TOO_LONG]: 'Number is too long.',
  [intlTelInputUtils.validationError.NOT_A_NUMBER]: 'Must be numbers only.'
}

export function getValidationErrorMessage(code: intlTelInputUtils.validationError): string {
  const message = VALIDATOR_CODE_MESSAGES[code]
  return message ?? 'Invalid number.'
}
