import { isNumeric } from './is-numeric'

/**
 * Returns the number of fractional digits.
 *
 * NOTE: This is intended for input validation, so trailing 0's will be included
 * in the total. Also, localization is not considered, so '.' is assumed to be
 * the fractional separator.
 */
export function fractionalDigitsCount(value: string): number | null {
  if (!isNumeric(value)) {
    return null
  }

  const a = value.split('.')
  if (a.length !== 2) {
    return null
  }

  return a[1].length
}
