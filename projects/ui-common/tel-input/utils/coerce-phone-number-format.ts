import { intlTelInputUtils } from '../intl-tel-input'
import { TelInputNumberFormatName } from '../models/index'

export const THESEAM_DEFAULT_PHONE_NUMBER_FORMAT = intlTelInputUtils.numberFormat.INTERNATIONAL

/**
 * Types that should be acceptable in a template.
 */
export type TheSeamNumberFormatsInput =
  // Enum
  intlTelInputUtils.numberFormat
  // Strings matching enum
  | 'E164'
  | 'INTERNATIONAL'
  | 'NATIONAL'
  | 'RFC3966'
  // Strings matching enum in lower case, since it would be what a user will
  // most likely type if string is necessary.
  | 'e164'
  | 'international'
  | 'national'
  | 'rfc3966'

export function coercePhoneNumberFormat(
  format: TheSeamNumberFormatsInput,
  defaultFormat = THESEAM_DEFAULT_PHONE_NUMBER_FORMAT
): intlTelInputUtils.numberFormat {
  let res = defaultFormat

  if (typeof format === 'string') {
    const _format = TelInputNumberFormatName[`${format}`.trim().toUpperCase()]
    res = (_format === undefined || _format === null) ? defaultFormat : _format
  } else if (typeof format === 'number') {
    // We could check for a number range, but I think it is safer to assume it's
    // valid if a number was provided. A number most likely means the value came
    // from using the enum and I don't want to accidentaly exclude a format that
    // we don't have documented.
    //
    // NOTE: We may want to limit it to specific numbers though and assume that
    // potentialy excluded formats are not intended to be used by this library.
    res = format
  }

  return res
}
